/// <reference types="vite/client" />

// React initialization and global scope
interface Window {
  __reactReady?: Promise<void>;
  __resolveReact?: () => void;
  React?: typeof import('react');
  ReactDOM?: typeof import('react-dom');
}
