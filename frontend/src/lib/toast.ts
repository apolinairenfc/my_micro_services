type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

type Listener = (toast: ToastMessage) => void;

const listeners = new Set<Listener>();

export const subscribeToasts = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const emit = (toast: ToastMessage) => {
  listeners.forEach((listener) => listener(toast));
};

const createToast = (type: ToastType, message: string) => {
  const toast = { id: crypto.randomUUID(), type, message };
  emit(toast);
};

export const toast = {
  success: (message: string) => createToast('success', message),
  error: (message: string) => createToast('error', message),
  info: (message: string) => createToast('info', message),
};
