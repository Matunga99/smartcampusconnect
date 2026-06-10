import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import App from './App.tsx';
import './index.css';

// ── Service Worker + Push Notifications ──────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[SW] Registered:', reg.scope);

      // Subscribe to push notifications after SW is ready
      await subscribeToPush(reg);
    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
  });
}

async function subscribeToPush(reg: ServiceWorkerRegistration) {
  try {
    // Only subscribe if user has granted (or not yet decided) notification permission
    if (Notification.permission === 'denied') return;

    // Fetch VAPID public key from server
    const keyRes = await fetch('/api/push/vapid-public-key');
    if (!keyRes.ok) return;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return; // VAPID not configured on server

    // Check if already subscribed
    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub) {
      await sendSubscriptionToServer(existingSub);
      return;
    }

    // Request permission and subscribe
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await sendSubscriptionToServer(sub);
    console.log('[PUSH] Subscribed to push notifications');
  } catch (err) {
    // Push subscription is non-critical — fail silently
    console.warn('[PUSH] Subscription skipped:', err);
  }
}

async function sendSubscriptionToServer(sub: PushSubscription) {
  const token = localStorage.getItem('scc_token');
  if (!token) return; // Not logged in yet — will retry on next load
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription: sub.toJSON() })
    });
  } catch { /* non-critical */ }
}

/** Convert VAPID base64 key to Uint8Array for pushManager.subscribe */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// ── Render App ────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
      <ToastContainer />
    </ToastProvider>
  </StrictMode>,
);
