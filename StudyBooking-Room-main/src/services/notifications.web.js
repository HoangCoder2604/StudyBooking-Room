let enabled = false;

export async function initializeNotifications({ notificationsEnabled }) {
  enabled = Boolean(notificationsEnabled);
  if (!enabled || !('Notification' in window)) return false;
  if (Notification.permission === 'default') await Notification.requestPermission();
  return Notification.permission === 'granted';
}

export async function notifySystem(title, body, data = {}) {
  if (enabled && 'Notification' in window && Notification.permission === 'granted') new Notification(title, { body, data });
}

export async function scheduleBookingReminder() {}
export async function cancelBookingReminder() {}
export async function disableNotifications() { enabled = false; }
