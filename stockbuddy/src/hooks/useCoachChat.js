import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for managing AI Coach chat functionality
 * 
 * @param {Object} scenario - The current trading scenario
 * @param {boolean} enabled - Whether chat is enabled (default: true)
 * @returns {Object} Chat state and handlers
 */
export function useCoachChat(scenario, enabled = true) {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Initialize welcome message when scenario changes
  // Note: This is controlled externally via setChatMessages for bounce scenario logic
  useEffect(() => {
    if (!enabled || !scenario) return;
    
    // Only show welcome message if no messages exist
    if (chatMessages.length === 0) {
      const puzzleTypeHint = scenario?.puzzleType === 'buy' 
        ? 'Your challenge is to decide when to **enter** this trade. Consider factors like timing, entry price, and market conditions.'
        : scenario?.puzzleType === 'sell'
        ? 'Your challenge is to decide when to **exit** your position. Consider profit targets, risk management, and market signals.'
        : 'Your challenge is to make the best trading decision based on the scenario.';
      
      const welcomeMessage = {
        type: 'ai',
        content: `Welcome to the **${scenario?.title || 'Trading'}** challenge! 🎯\n\nI'm your AI trading coach, here to help you master trading through real historical scenarios.\n\n## What I Can Help With:\n• **Understanding market concepts** - Ask me about technical analysis, fundamentals, or market psychology\n• **Exploring this scenario** - I can explain key events, market conditions, and what traders were thinking\n• **Decision frameworks** - Learn how to evaluate opportunities and manage risk\n• **Historical context** - Understand what actually happened and why\n\n${puzzleTypeHint}\n\n**Feel free to ask me anything!** For example:\n• "What factors should I consider for this decision?"\n• "Can you explain [any trading concept]?"\n• "What was happening in the market during this scenario?"\n\n*Remember: I'm here to teach, not to tell you what to do. The best learning comes from understanding the "why" behind trading decisions.*`,
        timestamp: Date.now()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [scenario?.id, enabled, chatMessages.length, setChatMessages]); // Only reset when scenario ID changes

  // Note: Auto-scroll is now handled in CoachChat component to avoid page scroll
  // This useEffect is intentionally minimal to prevent page nudging

  /**
   * Send a chat message to the AI coach
   * 
   * @param {string} message - The message to send (optional, uses userInput if not provided)
   */
  const sendMessage = async (message = null) => {
    const messageToSend = message || userInput.trim();
    if (!messageToSend || !scenario || !enabled) return;

    const userMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCoachChat] Sending message:', messageToSend);
      console.log('[useCoachChat] Scenario object:', scenario);
      
      // Backend formatChatUserContent expects: scenario.title, scenario.context, scenario.keyEvents
      // The scenario object structure is: { title, scenario: { context, keyEvents, ... } }
      // We need to send a merged object with title and the nested scenario properties
      let scenarioData;
      if (scenario?.scenario) {
        // Merge top-level title with nested scenario properties
        scenarioData = {
          title: scenario.title,
          ...scenario.scenario
        };
      } else {
        scenarioData = scenario;
      }
      
      const response = await api.sendCoachMessage({
        message: messageToSend,
        scenario: scenarioData,
        chatHistory: chatMessages
      });

      console.log('[useCoachChat] Response received:', response);

      if (response && response.success) {
        const aiMessage = {
          type: 'ai',
          content: response.response || response.message || 'No response content',
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        console.warn('[useCoachChat] Response not successful:', response);
        // More helpful fallback response based on error type
        let fallbackContent = "I'm here to help you learn about trading! Ask me about market psychology, technical analysis, risk management, or any trading concepts you'd like to understand better.";
        
        if (response?.error) {
          if (response.error.includes('not configured') || response.error.includes('503')) {
            fallbackContent = "I apologize, but the AI coach service isn't configured right now. Please check with the administrator to set up the AI service.";
          } else if (response.error.includes('timeout')) {
            fallbackContent = "I apologize, but my response is taking longer than expected. Please try asking your question again in a moment.";
          } else {
            fallbackContent = `I'm having trouble connecting right now. ${response.error}. Please try again in a moment, or ask a different question.`;
          }
        }
        
        const fallbackMessage = {
          type: 'ai',
          content: fallbackContent,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, fallbackMessage]);
        setError(response?.error || response?.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('[useCoachChat] Error caught:', err);
      console.error('[useCoachChat] Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      // More helpful error message based on error type
      let errorContent = "I apologize, but I'm having trouble connecting right now. ";
      
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorContent += "It looks like there's a network issue. Please check your internet connection and try again.";
      } else if (err.message.includes('timeout')) {
        errorContent += "The request timed out. Please try asking your question again - sometimes I need a moment to process complex questions.";
      } else if (err.message.includes('503') || err.message.includes('Service Unavailable')) {
        errorContent += "The AI service is temporarily unavailable. Please try again in a few moments.";
      } else {
        errorContent += `Error: ${err.message || 'Unknown error'}. Please try again or rephrase your question.`;
      }
      
      const errorMessage = {
        type: 'ai',
        content: errorContent,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
      console.log('[useCoachChat] Loading state set to false');
    }
  };

  /**
   * Add a message to the chat (for external use, e.g., decision analysis)
   * 
   * @param {Object} message - Message object with type and content
   */
  const addMessage = (message) => {
    if (!message || !message.content) return;
    const newMessage = {
      type: message.type || 'ai',
      content: message.content,
      timestamp: message.timestamp || Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  /**
   * Clear chat messages
   */
  const clearMessages = () => {
    setChatMessages([]);
    setError(null);
  };

  /**
   * Reset chat for a new scenario
   */
  const resetChat = () => {
    clearMessages();
    setUserInput('');
    setError(null);
  };

  return {
    // State
    chatMessages,
    userInput,
    isLoading,
    error,
    chatEndRef,
    
    // Handlers
    sendMessage,
    addMessage,
    clearMessages,
    resetChat,
    setUserInput,
    setChatMessages
  };
}

