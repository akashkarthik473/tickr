import React from 'react';
import { useCoachChat } from '../hooks/useCoachChat';
import { marbleWhite, marbleLightGray, marbleGray, marbleDarkGray, marbleGold } from '../marblePalette';
import { fontHeading, fontBody } from '../fontPalette';

/**
 * CoachChat Component
 * 
 * Displays the chat transcript UI for the AI Trading Coach.
 * Handles message display, input, and auto-scrolling.
 * 
 * @param {Object} props
 * @param {Object} props.scenario - The current trading scenario
 * @param {boolean} props.enabled - Whether chat is enabled (default: true)
 * @param {boolean} props.disabled - Whether chat input is disabled (e.g., scenario completed)
 * @param {string} props.placeholder - Custom placeholder text for input
 * @param {Function} props.onMessageSent - Callback when a message is sent
 * @param {Function} props.onError - Callback when an error occurs
 */
export function CoachChat({ 
  scenario, 
  enabled = true, 
  disabled = false,
  placeholder = null,
  onMessageSent = null,
  onError = null
}) {
  const {
    chatMessages,
    userInput,
    isLoading,
    error,
    chatEndRef,
    sendMessage,
    setUserInput
  } = useCoachChat(scenario, enabled);

  // Notify parent of errors
  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || disabled || !enabled) return;
    
    await sendMessage();
    
    if (onMessageSent) {
      onMessageSent(userInput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const defaultPlaceholder = scenario 
    ? `Ask about ${scenario.symbol}, ${scenario.puzzleType?.toUpperCase()} puzzle, or any trading concept...`
    : 'Ask me about trading...';

  return (
    <div style={{
      backgroundColor: marbleLightGray,
      borderRadius: '20px',
      padding: '16px',
      height: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: marbleDarkGray,
        marginBottom: '16px',
        fontFamily: fontHeading
      }}>
        💬 AI Trading Coach
      </h3>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        padding: '8px',
        backgroundColor: marbleWhite,
        borderRadius: '12px'
      }}>
        {chatMessages.map((message, index) => (
          <div key={index} style={{
            marginBottom: '12px',
            textAlign: message.type === 'user' ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: message.type === 'user' ? marbleGold : marbleLightGray,
              color: message.type === 'user' ? marbleDarkGray : marbleDarkGray,
              fontSize: '14px',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              fontFamily: fontBody
            }}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{
            textAlign: 'left',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: marbleLightGray,
              color: marbleDarkGray,
              fontSize: '14px',
              fontFamily: fontBody
            }}>
              🤖 AI is thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      {!disabled && enabled && (
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || defaultPlaceholder}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '14px',
              fontFamily: fontBody,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'text'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: marbleGold,
              color: marbleDarkGray,
              fontWeight: 'bold',
              cursor: isLoading || !userInput.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: fontBody,
              opacity: isLoading || !userInput.trim() ? 0.6 : 1
            }}
          >
            Send
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '12px',
          fontFamily: fontBody
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

