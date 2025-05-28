/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />
/// <reference lib="es2015" />

declare global {
  type EmptyObject = Record<string, never>;
  interface GlobalThis {
    gc?: () => void;
  }
}

export interface GlobalWithGC {
  gc?: () => void;
}

export {};
