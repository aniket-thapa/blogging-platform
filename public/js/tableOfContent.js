document.addEventListener('DOMContentLoaded', function () {
  const content = document.getElementById('blog-content');
  const tocContainer = document.getElementById('toc-container');
  const tocList = document.getElementById('table-of-contents');

  if (!content || !tocContainer || !tocList) return;

  const headings = content.querySelectorAll('h2, h3, h4');

  // If no headings exist, hide the TOC container
  if (headings.length === 0) {
    tocContainer.classList.remove('lg:block');
    return;
  }

  let headingPositions = [];

  // Populate the TOC
  headings.forEach((heading, index) => {
    let id = heading.innerText
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, ''); // Remove special characters

    heading.id = id; // Assign the generated ID to the heading

    const listItem = document.createElement('li');
    listItem.classList.add('flex', 'justify-start', 'items-center');
    listItem.innerHTML = `<i class="fa-solid fa-caret-right"></i><a href="#${id}" class="block px-3 py-2 my-1 text-sm text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500 hover:bg-opacity-10 rounded-lg toc-link transition" data-id="${id}">
        
        ${heading.innerText}
      </a>
    `;
    tocList.appendChild(listItem);
  });

  // Show TOC if headings exist
  tocContainer.classList.remove('hidden');

  const tocLinks = document.querySelectorAll('.toc-link');

  function updateHeadingPositions() {
    headingPositions = Array.from(headings).map((heading) => ({
      id: heading.id,
      offsetTop: heading.getBoundingClientRect().top + window.scrollY - 100,
    }));
  }
  updateHeadingPositions();

  function highlightActiveHeading() {
    let scrollPosition = window.scrollY + 120;
    let activeId = headingPositions.find((heading, index) => {
      const nextHeading = headingPositions[index + 1];
      return (
        scrollPosition >= heading.offsetTop &&
        (!nextHeading || scrollPosition < nextHeading.offsetTop)
      );
    })?.id;

    if (activeId) {
      tocLinks.forEach((link) => {
        link.classList.remove(
          'text-blue-500',
          'bg-blue-500',
          'bg-opacity-10',
          'font-semibold'
        );
        if (link.getAttribute('data-id') === activeId) {
          link.classList.add(
            'text-blue-500',
            'bg-blue-500',
            'bg-opacity-10',
            'font-semibold'
          );
          link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }

  tocLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.history.pushState(null, '', `#${targetId}`);
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    });
  });

  window.addEventListener('scroll', highlightActiveHeading);
  window.addEventListener('resize', updateHeadingPositions);
});
