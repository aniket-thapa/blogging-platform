// Scroll to Top Icon
const scrollToTopButton = document.getElementById('scroll-to-top');

// Show the button when the user scrolls to the bottom
window.addEventListener('scroll', () => {
  if (document.body.scrollTop > 70 || document.documentElement.scrollTop > 70) {
    scrollToTopButton.classList.remove('hidden');
  } else {
    scrollToTopButton.classList.add('hidden');
  }
});
scrollToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
