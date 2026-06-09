import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch((err) => console.error('Service worker registration failed: ', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
      <ToastContainer />
    </ToastProvider>
  </StrictMode>,
);
