import { fn } from 'storybook/test';
import { CoachChat } from './CoachChat';
import '../globals.css';

// Mock fetch for Storybook to prevent real API calls
// This allows visual regression testing without backend
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0];
    // Mock AI coach chat endpoint
    if (typeof url === 'string' && url.includes('/ai-coach/chat')) {
      return new Response(
        JSON.stringify({
          success: true,
          response: 'This is a mock AI response for visual testing purposes. It demonstrates how the chat component displays responses from the AI coach.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // For other endpoints, use original fetch or return empty response
    return originalFetch(...args).catch(() => {
      return new Response(
        JSON.stringify({ success: false, error: 'Mock: API not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    });
  };
}

// Mock scenario data for stories
const mockScenarioSell = {
  id: 1,
  title: "Tesla's 2020 Breakout",
  symbol: "TSLA",
  puzzleType: 'sell',
  initialPrice: 70,
  scenario: {
    context: "You already own Tesla shares that you bought at $70 during the March 2020 crash. Now the stock is recovering and you need to decide: when do you sell?",
    keyEvents: [
      "March 2020: COVID-19 crash hits markets",
      "May 2020: Tesla announces strong Q1 delivery numbers",
      "July 2020: Tesla reports profitable Q2",
      "December 2020: S&P 500 inclusion announced"
    ]
  }
};

const mockScenarioBuy = {
  id: 3,
  title: "Apple's iPhone Launch",
  symbol: "AAPL",
  puzzleType: 'buy',
  initialPrice: 150,
  scenario: {
    context: "You have cash and Apple is launching the revolutionary iPhone at $150 per share. Many analysts think it's overpriced, but you see potential.",
    keyEvents: [
      "June 2007: iPhone announced",
      "September 2007: iPhone launches",
      "January 2008: Strong holiday sales",
      "June 2008: iPhone 3G announced"
    ]
  }
};

export default {
  title: 'AICoach/CoachChat',
  component: CoachChat,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#222222' },
        { name: 'light', value: '#F4F1E9' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    scenario: {
      control: 'object',
      description: 'The current trading scenario object',
    },
    enabled: {
      control: 'boolean',
      description: 'Whether chat is enabled',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether chat input is disabled (e.g., scenario completed)',
    },
    placeholder: {
      control: 'text',
      description: 'Custom placeholder text for input',
    },
    onMessageSent: {
      action: 'message sent',
      description: 'Callback when a message is sent',
    },
    onError: {
      action: 'error occurred',
      description: 'Callback when an error occurs',
    },
  },
  args: {
    onMessageSent: fn(),
    onError: fn(),
  },
};

/**
 * Default chat state with welcome message
 */
export const Default = {
  args: {
    scenario: mockScenarioSell,
    enabled: true,
    disabled: false,
  },
};

/**
 * Chat for a buy scenario
 */
export const BuyScenario = {
  args: {
    scenario: mockScenarioBuy,
    enabled: true,
    disabled: false,
  },
};

/**
 * Chat disabled when scenario is completed
 */
export const Completed = {
  args: {
    scenario: mockScenarioSell,
    enabled: true,
    disabled: true,
  },
};

/**
 * Chat disabled/enabled state
 */
export const Disabled = {
  args: {
    scenario: mockScenarioSell,
    enabled: false,
    disabled: true,
  },
};

/**
 * Chat with custom placeholder
 */
export const CustomPlaceholder = {
  args: {
    scenario: mockScenarioSell,
    enabled: true,
    disabled: false,
    placeholder: 'Ask me anything about trading strategies...',
  },
};

/**
 * Chat with no scenario (loading state)
 */
export const NoScenario = {
  args: {
    scenario: null,
    enabled: true,
    disabled: false,
  },
};

