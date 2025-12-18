// @ts-nocheck
/// <reference types="vitest" />
import { vi } from "vitest";

export type AsyncIterableLike<T> = AsyncIterable<T>;

export function createAsyncIterable<T>(items: T[]): AsyncIterableLike<T> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const item of items) {
        yield item;
      }
    },
  };
}

export function createStripeMock(): {
  webhooks: { constructEventAsync: ReturnType<typeof vi.fn> };
  charges: { retrieve: ReturnType<typeof vi.fn> };
  customers: { retrieve: ReturnType<typeof vi.fn> };
  subscriptions: { retrieve: ReturnType<typeof vi.fn> };
  subscriptionSchedules: { retrieve: ReturnType<typeof vi.fn> };
  subscriptionItems: { list: ReturnType<typeof vi.fn> };
  checkout: {
    sessions: {
      retrieve: ReturnType<typeof vi.fn>;
      list: ReturnType<typeof vi.fn>;
      listLineItems: ReturnType<typeof vi.fn>;
    };
  };
  invoices: {
    retrieve: ReturnType<typeof vi.fn>;
    listLineItems: ReturnType<typeof vi.fn>;
  };
  refunds: {
    retrieve: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };
  disputes: { retrieve: ReturnType<typeof vi.fn> };
  creditNotes: {
    retrieve: ReturnType<typeof vi.fn>;
    listLineItems: ReturnType<typeof vi.fn>;
  };
  products: { retrieve: ReturnType<typeof vi.fn> };
  prices: { retrieve: ReturnType<typeof vi.fn> };
  plans: { retrieve: ReturnType<typeof vi.fn> };
  paymentIntents: { retrieve: ReturnType<typeof vi.fn> };
  paymentMethods: {
    retrieve: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };
  setupIntents: { retrieve: ReturnType<typeof vi.fn> };
  taxIds: {
    retrieve: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };
  radar: {
    earlyFraudWarnings: {
      retrieve: ReturnType<typeof vi.fn>;
      list: ReturnType<typeof vi.fn>;
    };
  };
  reviews: { retrieve: ReturnType<typeof vi.fn> };
  entitlements: {
    activeEntitlements: { list: ReturnType<typeof vi.fn> };
    features: {
      retrieve: ReturnType<typeof vi.fn>;
      list: ReturnType<typeof vi.fn>;
    };
  };
} {
  return {
    webhooks: {
      constructEventAsync: vi.fn(),
    },
    charges: {
      retrieve: vi.fn(),
    },
    customers: {
      retrieve: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
    subscriptionSchedules: {
      retrieve: vi.fn(),
    },
    subscriptionItems: {
      list: vi.fn(),
    },
    checkout: {
      sessions: {
        retrieve: vi.fn(),
        list: vi.fn(),
        listLineItems: vi.fn(() => createAsyncIterable<unknown>([])),
      },
    },
    invoices: {
      retrieve: vi.fn(),
      listLineItems: vi.fn(() => createAsyncIterable<unknown>([])),
    },
    refunds: {
      retrieve: vi.fn(),
      list: vi.fn(() => createAsyncIterable<unknown>([])),
    },
    disputes: {
      retrieve: vi.fn(),
    },
    creditNotes: {
      retrieve: vi.fn(),
      listLineItems: vi.fn(() => createAsyncIterable<unknown>([])),
    },
    products: {
      retrieve: vi.fn(),
    },
    prices: {
      retrieve: vi.fn(),
    },
    plans: {
      retrieve: vi.fn(),
    },
    paymentIntents: {
      retrieve: vi.fn(),
    },
    paymentMethods: {
      retrieve: vi.fn(),
      list: vi.fn(() => createAsyncIterable<unknown>([])),
    },
    setupIntents: {
      retrieve: vi.fn(),
    },
    taxIds: {
      retrieve: vi.fn(),
      list: vi.fn(() => createAsyncIterable<unknown>([])),
    },
    radar: {
      earlyFraudWarnings: {
        retrieve: vi.fn(),
        list: vi.fn(() => createAsyncIterable<unknown>([])),
      },
    },
    reviews: {
      retrieve: vi.fn(),
    },
    entitlements: {
      activeEntitlements: {
        list: vi.fn(() => createAsyncIterable<unknown>([])),
      },
      features: {
        retrieve: vi.fn(),
        list: vi.fn(() => createAsyncIterable<unknown>([])),
      },
    },
  };
}
