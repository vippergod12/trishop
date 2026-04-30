/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZALO_PHONE?: string;
  readonly VITE_ZALO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
