const listeners = new Set();

export const subscribeNotifications = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notify = (payload) => {
  listeners.forEach((listener) => listener(payload));
};

export const notifyError = (message, options = {}) => {
  notify({
    severity: 'error',
    title: options.title || 'Hata',
    message,
    details: options.details
  });
};

export const notifyWarning = (message, options = {}) => {
  notify({
    severity: 'warning',
    title: options.title || 'Uyarı',
    message,
    details: options.details
  });
};

export const notifySuccess = (message, options = {}) => {
  notify({
    severity: 'success',
    title: options.title || 'Bilgi',
    message,
    details: options.details
  });
};
