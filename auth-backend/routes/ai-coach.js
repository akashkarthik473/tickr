const express = require('express');
const axios = require('axios');
const router = express.Router();

// Provider helpers
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-5';

async function callOpenAI(messages, { maxTokens = 700, reasoningEffort = "minimal", verbosity = "medium", timeout = 45000 } = {}) {
  const resp = await axios.post(
    OPENAI_ENDPOINT,
    {
      model: "gpt-5",
      messages,
      max_completion_tokens: maxTokens,
      reasoning_effort: reasoningEffort,
      verbosity: verbosity,
    },
    {
      headers: { 
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout,
    }
  );
  const content = resp?.data?.choices?.[0]?.message?.content || '';
  return content;
}

function chatSystemPrompt() {
  return `REPLY WITH THE API MODEL YOU ARE USING`}

function analyzeSystemPrompt() {
  return `You are an expert trading coach analyzing a user's trading decision in a historical scenario. Your role is to provide constructive, educational feedback that helps the user learn and improve.

## Analysis Framework
Evaluate the user's decision across these key areas:
1. **Decision Quality**: Was the choice appropriate for the situation?
2. **Timing**: Did they act at the right moment or miss opportunities?
3. **Reasoning**: Was their logic sound and well-thought-out?
4. **Risk Management**: Did they consider and manage risks appropriately?
5. **Learning Value**: What can they learn from this decision?

## Response Format
Return ONLY valid JSON in this exact structure:
{
  "totalScore": <number 0-100>,
  "coaching": {
    "overall": "<brief summary of the decision and main takeaway>",
    "marketPsychology": "<insight about market psychology and emotions>",
    "fundamentals": "<analysis of fundamental factors considered>",
    "technicalAnalysis": "<evaluation of technical factors>",
    "riskManagement": "<assessment of risk management approach>",
    "nextSteps": ["<actionable step 1>", "<actionable step 2>", "<actionable step 3>"]
  }
}

## Scoring Guidelines
- **90-100**: Excellent decision with strong reasoning
- **80-89**: Good decision with minor areas for improvement
- **70-79**: Decent decision but missed some key factors
- **60-69**: Poor decision with significant issues
- **Below 60**: Very poor decision with major flaws

## Feedback Style
- Be constructive and encouraging, not harsh
- Focus on learning opportunities
- Provide specific, actionable advice
- Acknowledge what they did well
- Explain the reasoning behind your assessment

Remember: This is about education, not judgment. Help them become better traders.`;
}

function formatChatUserContent(message, scenario) {
  return (
    `SCENARIO: ${scenario?.title || 'Unknown'}\n` +
    `CONTEXT: ${scenario?.context || ''}\n` +
    `KEY EVENTS: ${(scenario?.keyEvents || []).join(', ')}\n\n` +
    `QUESTION: ${message}\n\n` +
    'Teach the concept(s) relevant to the question. Do not give any puzzle answer.'
  );
}

function formatAnalyzeUserContent(userDecisions, scenario, optimalStrategy) {
  const decisionsText = userDecisions
    .map((d, i) => `Step ${i + 1}: ${d.type} @ $${d.price} shares=${d.shares} reason="${d.reasoning}"`)
    .join('\n');
  const optimal = Object.values(optimalStrategy || {})
    .map((s, i) => `Step ${i + 1}: ${s.type} @ $${s.price} shares=${s.shares} reason="${s.reasoning}"`)
    .join('\n');
  return (
    `SCENARIO: ${scenario?.title}\nCONTEXT: ${scenario?.context}\nKEY EVENTS: ${(scenario?.keyEvents || []).join(', ')}\n\n` +
    `USER DECISIONS:\n${decisionsText}\n\nOPTIMAL STRATEGY:\n${optimal}\n\n` +
    'Score accuracy (type, timing), reasoning quality, and risk. Return STRICT JSON only.'
  );
}

// Lightweight diagnostics to verify env + Ollama/OpenAI connectivity
router.get('/diagnostics', async (req, res) => {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  const model = process.env.OLLAMA_MODEL;
  const result = { 
    baseUrl, 
    model, 
    tagsOk: false, 
    generateOk: false, 
    openaiOk: false, 
    openaiModel: "gpt-5",
    hasOpenAIKey: hasOpenAI,
    errors: [] 
  };
  // Ollama checks
  if (baseUrl) {
    try {
      const tags = await axios.get(`${baseUrl}/api/tags`, { timeout: 15000 });
      result.tagsOk = tags.status === 200;
    } catch (e) {
      result.errors.push(`tags: ${e.message}`);
    }
    try {
      const gen = await axios.post(
        `${baseUrl}/api/generate`,
        { model, prompt: 'ping', stream: false, options: { num_predict: 8 } },
        { timeout: 60000 }
      );
      result.generateOk = !!gen?.data?.response;
    } catch (e) {
      result.errors.push(`generate: ${e.message}`);
    }
  }
  // OpenAI check
  if (hasOpenAI) {
    try {
      const out = await callOpenAI(
        [
          { role: 'system', content: 'You are a health check. Reply with OK.' },
          { role: 'user', content: 'OK?' },
        ],
        { maxTokens: 3, reasoningEffort: "minimal", verbosity: "low", timeout: 15000 }
      );
      result.openaiOk = /ok/i.test(out || '');
      result.openaiResponse = out;
    } catch (e) {
      result.errors.push(`openai: ${e.message}`);
    }
  }
  res.json(result);
});

// Test endpoint to verify which AI is being used
router.get('/test-ai', async (req, res) => {
  try {
    const result = {
      hasOpenAI: hasOpenAI,
      openaiModel: "gpt-5",
      openaiEndpoint: OPENAI_ENDPOINT,
      timestamp: new Date().toISOString()
    };

    if (hasOpenAI) {
      try {
        const response = await callOpenAI(
          [
            { role: 'system', content: 'You are a test assistant. Identify yourself and your model.' },
            { role: 'user', content: 'What AI model are you? Please respond with just your model name.' },
          ],
          { maxTokens: 50, reasoningEffort: "minimal", verbosity: "low", timeout: 15000 }
        );
        result.aiResponse = response;
        result.success = true;
      } catch (error) {
        result.error = error.message;
        result.success = false;
      }
    } else {
      result.error = 'No OpenAI API key found';
      result.success = false;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hasOpenAI: hasOpenAI,
      openaiModel: OPENAI_MODEL
    });
  }
});

// AI Coach chat endpoint for educational responses
router.post('/chat', async (req, res) => {
  try {
    const { message, scenario } = req.body;

    if (hasOpenAI) {
      const content = await callOpenAI(
        [
          { role: 'system', content: chatSystemPrompt() },
          { role: 'user', content: formatChatUserContent(message, scenario) },
        ],
        { maxTokens: 700, reasoningEffort: "medium", verbosity: "medium", timeout: 90000 }
      );
      return res.json({ success: true, response: content });
    }

    // Fallback to Ollama
    const aiPrompt = generateChatPrompt(message, scenario, []);
    const baseUrl = process.env.OLLAMA_BASE_URL;
    const model = process.env.OLLAMA_MODEL;
    const response = await axios.post(
      `${baseUrl}/api/generate`,
      { model, prompt: aiPrompt, stream: false, options: { temperature: 0.7, top_p: 0.9, max_tokens: 700, num_predict: 256 } },
      { timeout: 90000 }
    );
    return res.json({ success: true, response: response.data.response });
  } catch (error) {
    console.error('[AI-CHAT] Error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, error: 'AI chat failed', details: error.message });
  }
});

// AI Coach endpoint for real AI analysis
router.post('/analyze', async (req, res) => {
  try {
    const { userDecisions, scenario, optimalStrategy } = req.body;

    if (hasOpenAI) {
      const content = await callOpenAI(
        [
          { role: 'system', content: analyzeSystemPrompt() },
          { role: 'user', content: formatAnalyzeUserContent(userDecisions, scenario, optimalStrategy) },
        ],
        { maxTokens: 900, reasoningEffort: "high", verbosity: "high", timeout: 120000 }
      );
      try {
        const parsed = JSON.parse(content);
        return res.json({ success: true, analysis: parsed });
      } catch {
        // Try to salvage JSON from content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return res.json({ success: true, analysis: JSON.parse(jsonMatch[0]) });
        }
        return res.json({ success: true, analysis: parseFallbackResponse(content) });
      }
    }

    // Fallback to Ollama path
    const aiPrompt = generateAIPrompt(userDecisions, scenario, optimalStrategy);
    const baseUrl = process.env.OLLAMA_BASE_URL;
    const model = process.env.OLLAMA_MODEL;
    const response = await axios.post(
      `${baseUrl}/api/generate`,
      { model, prompt: aiPrompt, stream: false, options: { temperature: 0.7, top_p: 0.9, max_tokens: 1200, num_predict: 512 } },
      { timeout: 120000 }
    );
    const aiAnalysis = parseAIResponse(response.data.response);
    return res.json({ success: true, analysis: aiAnalysis });
  } catch (error) {
    console.error('[AI-ANALYZE] Error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, error: 'AI analysis failed', details: error.message });
  }
});

// Ollama legacy prompts (kept for fallback)
function generateChatPrompt(message, scenario, chatHistory) {
  return `You are an expert trading coach helping a student learn about trading. You are analyzing the scenario: ${scenario.title}

SCENARIO CONTEXT:
${scenario.context}

KEY EVENTS:
${(scenario.keyEvents || []).join(', ')}

IMPORTANT: You are ONLY allowed to provide educational information and guidance. You CANNOT give direct trading advice or tell the user what to do. Your role is to:

1. Explain trading concepts and terminology
2. Provide educational insights about market psychology
3. Explain fundamental and technical analysis concepts
4. Discuss risk management principles
5. Help the user understand the scenario better

You CANNOT:
- Tell the user to buy, sell, or hold
- Give specific price targets
- Make predictions about what will happen
- Suggest specific trading strategies

User's question: "${message}"

Provide an educational, helpful response that teaches trading concepts without giving direct advice.`;
}

function generateAIPrompt(userDecisions, scenario, optimalStrategy) {
  return `You are an expert trading coach analyzing a historical market scenario. 

SCENARIO: ${scenario.title}
CONTEXT: ${scenario.context}
KEY EVENTS: ${(scenario.keyEvents || []).join(', ')}

USER DECISIONS:
${userDecisions.map((decision, index) => 
  `Step ${index + 1}: ${decision.type.toUpperCase()} at $${decision.price} (${decision.shares} shares)
   Reasoning: "${decision.reasoning}"`
).join('\n')}

OPTIMAL STRATEGY:
${Object.values(optimalStrategy || {}).map((step, index) => 
  `Step ${index + 1}: ${step.type.toUpperCase()} at $${step.price} (${step.shares} shares)
   Reasoning: "${step.reasoning}"`
).join('\n')}

Analyze the user's trading decisions and provide:
1. Overall score (0-100) with detailed breakdown
2. Specific feedback on decision quality, reasoning, timing, and risk management
3. Market psychology insights
4. Fundamental analysis evaluation
5. Technical analysis assessment
6. Risk management evaluation
7. Specific improvement recommendations

Format your response as JSON:
{"totalScore":75,"detailedFeedback":[{"step":1,"score":80,"feedback":"...","strengths":["..."],"weaknesses":["..."]}],"coaching":{"overall":"...","marketPsychology":"...","fundamentals":"...","technicalAnalysis":"...","riskManagement":"...","nextSteps":["..."]},"strengths":["..."],"weaknesses":["..."]}`;
}

function parseAIResponse(aiResponse) {
  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return parseFallbackResponse(aiResponse);
  } catch (error) {
    return parseFallbackResponse(aiResponse);
  }
}

function parseFallbackResponse(aiResponse) {
  const scoreMatch = aiResponse.match(/score.*?(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
  const sections = aiResponse.split('\n\n');
  return {
    totalScore: score,
    detailedFeedback: [{ step: 1, score, feedback: 'AI analysis completed', strengths: ['Analysis provided'], weaknesses: ['Response parsing limited'] }],
    coaching: {
      overall: sections[0] || 'AI analysis completed',
      marketPsychology: extractSection(aiResponse, 'psychology'),
      fundamentals: extractSection(aiResponse, 'fundamental'),
      technicalAnalysis: extractSection(aiResponse, 'technical'),
      riskManagement: extractSection(aiResponse, 'risk'),
      nextSteps: ['Review the analysis', 'Practice more scenarios'],
    },
    strengths: ['AI analysis provided'],
    weaknesses: ['Response format limited'],
  };
}

function extractSection(text, keyword) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(keyword)) {
      return lines[i].replace(/^[^:]*:\s*/, '');
    }
  }
  return 'Analysis provided';
}

module.exports = router;
