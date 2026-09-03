interface Puter {
  ai: {
    chat: (prompt: string) => Promise<{ toString(): string }>;
  };
}

declare global {
  interface Window {
    puter: Puter;
  }
  const puter: Puter;
}

export {};
