import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyUrlFlags } from './utils/storage.js';
import './styles.css';

// Flags de teste via URL: ?reset=1 (limpa dados) e ?delay=ms (latência simulada)
applyUrlFlags();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
