import { storage } from './storage.js';

const DISMISSAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let deferredPrompt = null;
let snapshot = Object.freeze({ canInstall: false, installed: false });
const listeners = new Set();

function publish(patch) {
  snapshot = Object.freeze({ ...snapshot, ...patch });
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    publish({ canInstall: true, installed: false });
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    publish({ canInstall: false, installed: true });
  });
}

export function subscribeInstallPrompt(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallPromptSnapshot() {
  return snapshot;
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function wasInstallDismissedRecently() {
  const at = storage.loadInstallDismissedAt();
  return Boolean(at) && Date.now() - at < DISMISSAL_TTL_MS;
}

export function dismissInstallPrompt() {
  storage.saveInstallDismissedAt();
  deferredPrompt = null;
  publish({ canInstall: false });
}

export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';

  const event = deferredPrompt;
  deferredPrompt = null;
  publish({ canInstall: false });

  await event.prompt();
  const choice = event.userChoice ? await event.userChoice : { outcome: 'dismissed' };

  if (choice.outcome === 'accepted') publish({ installed: true });
  else storage.saveInstallDismissedAt();

  return choice.outcome;
}
