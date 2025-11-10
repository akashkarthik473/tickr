import '@testing-library/jest-dom';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
});

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    storage: {},
    getItem(key) {
      return this.storage[key] ?? null;
    },
    setItem(key, value) {
      this.storage[key] = String(value);
    },
    removeItem(key) {
      delete this.storage[key];
    },
    clear() {
      this.storage = {};
    }
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

