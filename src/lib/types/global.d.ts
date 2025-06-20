/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />
/// <reference lib="es2015" />

declare global {
  type IEmptyObject = Record<string, never>;
  interface IGlobalThis {
    gc?: () => void;
  }
}

export {};
