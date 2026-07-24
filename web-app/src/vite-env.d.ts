/// <reference types="vite/client" />

// Global type augmentations for the ComputeMarket web app

interface ImportMetaEnv {
  readonly VITE_COMPUTE_COIN_ADDRESS?: string;
  readonly VITE_MARKETPLACE_ADDRESS?: string;
  readonly VITE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  };
}
