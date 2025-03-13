import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Removida a extensão .tsx para evitar problemas
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
