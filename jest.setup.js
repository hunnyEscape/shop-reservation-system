// jest.setup.js
import '@testing-library/jest-dom';

// モックの実装
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(() => ({})),
    getApps: jest.fn(() => []),
    getApp: jest.fn(() => ({})),
  };
});

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(() => ({})),
    connectAuthEmulator: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(() => ({})),
    connectFirestoreEmulator: jest.fn(),
    collection: jest.fn(() => ({})),
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    serverTimestamp: jest.fn(() => new Date()),
    Timestamp: {
      fromDate: jest.fn(date => ({ toDate: () => date })),
      now: jest.fn(() => ({ toDate: () => new Date() })),
    },
  };
});

jest.mock('firebase/functions', () => {
  return {
    getFunctions: jest.fn(() => ({})),
    connectFunctionsEmulator: jest.fn(),
    httpsCallable: jest.fn(() => jest.fn()),
  };
});

// react-toastifyのモック
jest.mock('react-toastify', () => {
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
    ToastContainer: () => null,
  };
});

// nanoidのモック
jest.mock('nanoid', () => {
  return {
    nanoid: jest.fn(() => 'MOCK123'),
  };
});

// windowのlocation.pushのモック
Object.defineProperty(window, 'location', {
  value: {
    href: jest.fn(),
    pathname: '/',
    search: '',
    hash: '',
    host: 'localhost',
    origin: 'http://localhost',
    assign: jest.fn(),
    replace: jest.fn(),
  },
  writable: true,
});

// matchMediaのモック（レスポンシブデザインのテスト用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 非推奨
    removeListener: jest.fn(), // 非推奨
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// IntersectionObserverのモック
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};