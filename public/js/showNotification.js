function showNotification(message, notificationTime) {
  // Create Notification Container (if not exists)
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-20 right-5 space-y-3 z-50';
    document.body.appendChild(container);
  }

  // Create Notification Element
  const notification = document.createElement('div');
  notification.className =
    'relative flex items-center justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg shadow-lg opacity-0 translate-x-5 transition-all border border-gray-200 dark:border-gray-700 overflow-hidden';

  // Add Message
  const text = document.createElement('span');
  text.innerHTML = message;

  // Close Button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeButton.className =
    'ml-4 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 text-xl focus:outline-none';
  closeButton.onclick = () => removeNotification(notification);

  // Progress Bar
  const progressBar = document.createElement('div');
  progressBar.className =
    'absolute bottom-0 left-0 h-1 bg-blue-500 dark:bg-blue-400 transition-all';
  progressBar.style.width = '100%';

  // Append Elements
  notification.appendChild(text);
  notification.appendChild(closeButton);
  notification.appendChild(progressBar);
  container.appendChild(notification);

  // Animate In
  setTimeout(() => {
    notification.classList.remove('opacity-0', 'translate-x-5');
    notification.classList.add('opacity-100', 'translate-x-0');
  }, 100);

  // Animate Progress Bar
  setTimeout(() => {
    progressBar.style.transition = `width ${notificationTime}ms linear`;
    progressBar.style.width = '0%';
  }, 100);

  // Auto Remove After Time
  const timeout = setTimeout(
    () => removeNotification(notification),
    notificationTime
  );

  // Remove Notification Function
  function removeNotification(element) {
    clearTimeout(timeout); // Prevent auto removal if manually closed
    element.classList.remove('opacity-100', 'translate-x-0');
    element.classList.add('opacity-0', 'translate-x-5');
    setTimeout(() => element.remove(), 300);
  }
}
