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
      const welcomeMessage = {
        type: 'ai',
        content: `Welcome to the ${scenario.title} trading challenge! 🎯\n\nI'm your AI trading coach. I can help you understand market concepts, explain trading strategies, and provide educational insights.\n\nWhat would you like to know about this scenario?`,
        timestamp: Date.now()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [scenario?.id, enabled, chatMessages.length, setChatMessages]); // Only reset when scenario ID changes

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
        // Fallback response
        const fallbackMessage = {
          type: 'ai',
          content: "I'm here to help you learn about trading! Ask me about market psychology, technical analysis, risk management, or any trading concepts you'd like to understand better.",
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
      const errorMessage = {
        type: 'ai',
        content: `I apologize, but I'm having trouble connecting right now. Please try again later. Error: ${err.message || 'Unknown error'}`,
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

