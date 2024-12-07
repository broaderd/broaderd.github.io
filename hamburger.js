// hamburger.js
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const header = document.querySelector('.header');
  
    // Toggle the 'active' class on the header to show/hide the nav-links
    hamburger.addEventListener('click', function() {
      header.classList.toggle('active');
    });
  });