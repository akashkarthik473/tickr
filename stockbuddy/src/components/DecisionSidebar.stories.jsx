import { fn } from 'storybook/test';
import { DecisionSidebar } from './DecisionSidebar';
import '../globals.css';

// Mock scenario data for stories
const mockScenarioSell = {
  id: 1,
  title: "Tesla's 2020 Breakout",
  symbol: "TSLA",
  puzzleType: 'sell',
  initialPrice: 70,
  scenario: {
    context: "You already own Tesla shares that you bought at $70 during the March 2020 crash.",
    keyEvents: []
  }
};

const mockScenarioBuy = {
  id: 3,
  title: "Apple's iPhone Launch",
  symbol: "AAPL",
  puzzleType: 'buy',
  initialPrice: 150,
  scenario: {
    context: "You have cash and Apple is launching the revolutionary iPhone at $150 per share.",
    keyEvents: []
  }
};

const mockScenarioHold = {
  id: 4,
  title: "Bitcoin's 2017 Bull Run",
  symbol: "BTC",
  puzzleType: 'hold',
  initialPrice: 1000,
  scenario: {
    context: "You already own Bitcoin that you bought at $1,000. It's now at $20,000.",
    keyEvents: []
  }
};

export default {
  title: 'AICoach/DecisionSidebar',
  component: DecisionSidebar,
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
    scenarioCompleted: {
      control: 'boolean',
      description: 'Whether the scenario has been completed',
    },
    orderType: {
      control: 'select',
      options: ['', 'buy', 'sell', 'hold', 'limit-buy', 'limit-sell'],
      description: 'Current order type',
    },
    orderPrice: {
      control: 'text',
      description: 'Current order price value',
    },
    orderReasoning: {
      control: 'text',
      description: 'Current order reasoning text',
    },
    showOrderForm: {
      control: 'boolean',
      description: 'Whether to show the order form or action buttons',
    },
    beginnerBudget: {
      control: 'number',
      description: 'Available budget for beginner positions',
    },
    onOrderTypeChange: {
      action: 'order type changed',
      description: 'Callback when order type changes',
    },
    onOrderPriceChange: {
      action: 'order price changed',
      description: 'Callback when order price changes',
    },
    onOrderReasoningChange: {
      action: 'order reasoning changed',
      description: 'Callback when order reasoning changes',
    },
    onShowOrderFormChange: {
      action: 'show order form changed',
      description: 'Callback to show/hide order form',
    },
    onSubmitDecision: {
      action: 'decision submitted',
      description: 'Callback when decision is submitted',
    },
    onCancelOrder: {
      action: 'order cancelled',
      description: 'Callback when order form is cancelled',
    },
  },
  args: {
    onOrderTypeChange: fn(),
    onOrderPriceChange: fn(),
    onOrderReasoningChange: fn(),
    onShowOrderFormChange: fn(),
    onSubmitDecision: fn(),
    onCancelOrder: fn(),
  },
};

/**
 * Default state - Buy scenario with action buttons
 */
export const BuyScenario = {
  args: {
    scenario: mockScenarioBuy,
    scenarioCompleted: false,
    orderType: '',
    orderPrice: '',
    orderReasoning: '',
    showOrderForm: false,
    beginnerBudget: 1000,
  },
};

/**
 * Sell scenario with action buttons
 */
export const SellScenario = {
  args: {
    scenario: mockScenarioSell,
    scenarioCompleted: false,
    orderType: '',
    orderPrice: '',
    orderReasoning: '',
    showOrderForm: false,
    beginnerBudget: 1000,
  },
};

/**
 * Hold scenario with action buttons
 */
export const HoldScenario = {
  args: {
    scenario: mockScenarioHold,
    scenarioCompleted: false,
    orderType: '',
    orderPrice: '',
    orderReasoning: '',
    showOrderForm: false,
    beginnerBudget: 1000,
  },
};

/**
 * Buy order form open
 */
export const BuyOrderForm = {
  args: {
    scenario: mockScenarioBuy,
    scenarioCompleted: false,
    orderType: 'buy',
    orderPrice: '150',
    orderReasoning: 'I believe Apple has strong fundamentals and the iPhone will be revolutionary.',
    showOrderForm: true,
    beginnerBudget: 1000,
  },
};

/**
 * Limit buy order form
 */
export const LimitBuyOrderForm = {
  args: {
    scenario: mockScenarioBuy,
    scenarioCompleted: false,
    orderType: 'limit-buy',
    orderPrice: '145',
    orderReasoning: 'Waiting for a better entry price before buying.',
    showOrderForm: true,
    beginnerBudget: 1000,
  },
};

/**
 * Sell order form open
 */
export const SellOrderForm = {
  args: {
    scenario: mockScenarioSell,
    scenarioCompleted: false,
    orderType: 'sell',
    orderPrice: '700',
    orderReasoning: 'Taking profits after 10x gain. S&P inclusion is priced in.',
    showOrderForm: true,
    beginnerBudget: 1000,
  },
};

/**
 * Limit sell order form
 */
export const LimitSellOrderForm = {
  args: {
    scenario: mockScenarioSell,
    scenarioCompleted: false,
    orderType: 'limit-sell',
    orderPrice: '750',
    orderReasoning: 'Setting a higher target before selling.',
    showOrderForm: true,
    beginnerBudget: 1000,
  },
};

/**
 * Hold decision form
 */
export const HoldDecisionForm = {
  args: {
    scenario: mockScenarioHold,
    scenarioCompleted: false,
    orderType: 'hold',
    orderPrice: '0',
    orderReasoning: 'Bitcoin is in a strong uptrend. I want to let my winners run.',
    showOrderForm: true,
    beginnerBudget: 1000,
  },
};

/**
 * Order form with incomplete data (submit disabled)
 */
export const IncompleteForm = {
  args: {
    scenario: mockScenarioBuy,
    scenarioCompleted: false,
    orderType: 'buy',
    orderPrice: '150',
    orderReasoning: '', // Missing reasoning
    showOrderForm: true,
    beginnerBudget: 1000,
  },
};

/**
 * Scenario completed (component hidden)
 */
export const Completed = {
  args: {
    scenario: mockScenarioSell,
    scenarioCompleted: true,
    orderType: '',
    orderPrice: '',
    orderReasoning: '',
    showOrderForm: false,
    beginnerBudget: 1000,
  },
};

/**
 * Custom budget amount
 */
export const CustomBudget = {
  args: {
    scenario: mockScenarioBuy,
    scenarioCompleted: false,
    orderType: 'buy',
    orderPrice: '150',
    orderReasoning: 'Using a larger budget for this trade.',
    showOrderForm: true,
    beginnerBudget: 5000,
  },
};

