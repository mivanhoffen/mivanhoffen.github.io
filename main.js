document.addEventListener("DOMContentLoaded", function() {
  console.log("Main.js loaded successfully");

  // --- CONFIGURATION ---
  const MAX_WIDTH = 1710;
  const ASPECT_RATIO = 1654 / 2339; // Width / Height of a SINGLE page
  let currentFlipbookEl = null; 

  // --- HELPER: CALCULATE DIMENSIONS ---
  function getBookDimensions() {
      let width, height;
      if (window.innerWidth >= 1440) { width = Math.min(window.innerWidth * 0.8, MAX_WIDTH); } 
      else if (window.innerWidth >= 1024) { width = window.innerWidth * 0.9; } 
      else if (window.innerWidth >= 768) { width = window.innerWidth * 0.95; } 
      else { width = window.innerWidth * 0.95; }
      
      height = width * ASPECT_RATIO;
      
      // Height Cap (95vh) to prevent scrolling issues
      if (height > window.innerHeight * 0.95) {
          height = window.innerHeight * 0.95;
          width = height / ASPECT_RATIO;
      }
      return { width, height };
  }

  // --- CLICK HANDLER FOR OPENING BOOKS ---
  // We attach this to the document to catch clicks on any .book-cover or .btn-preview
  $('body').on('click', '.book-cover, .btn-preview', function(e) {
      e.preventDefault();
      console.log("Book clicked!");

      // Find the section this click belongs to
      let section = $(this).closest('section');
      let flipbookId = section.find('.flipbook').attr('id');
      
      if (!flipbookId) {
          console.error("No flipbook found in this section");
          return;
      }

      openBook(flipbookId);
  });

  // --- OPEN BOOK FUNCTION ---
 // --- OPEN BOOK FUNCTION ---
 window.openBook = function(elementId) { // Ensure this is attached to window if strictly needed, or just openBook
  console.log("Opening book: " + elementId);
  
  let targetFlipbook = $('#' + elementId);
  let targetSection = targetFlipbook.closest('section');
  let dims = getBookDimensions();

  // 1. Lock Scroll
  $('.snap-container').css('overflow', 'hidden');
  
  // 2. Hide the Text/Cover Wrapper
  targetSection.find('.book-display-wrapper').fadeOut(300);
  
  // 3. Show the Close Button
  targetSection.find('.exit-button').fadeIn();
  
  // 4. Show the Overlay & Initialize Turn.js
  let overlay = targetSection.find('.flipbook-overlay');
  
  // FIX: Use css to force flex, then animate opacity instead of standard fadeIn
  overlay.css({
      'display': 'flex',
      'opacity': 0
  }).animate({ opacity: 1 }, 500, function() {
      
      // This callback runs AFTER the overlay is visible. 
      
      if (!targetFlipbook.turn('is')) {
          console.log("Initializing turn.js");
          targetFlipbook.turn({
              width: dims.width,
              height: dims.height,
              autoCenter: true,
              display: 'double',
              acceleration: true,
              elevation: 50,
              gradients: true
          });
      } else {
          console.log("Resizing existing flipbook");
          targetFlipbook.turn('size', dims.width, dims.height);
          targetFlipbook.turn('page', 1); 
      }
      
      currentFlipbookEl = targetFlipbook;
  });
  
  // 5. Hide Navbar
  $('#navbar').css('right', '-100vw');
}

  // --- CLOSE BOOK HANDLER ---
  $('.exit-button').click(function() {
      console.log("Closing book");
      if(!currentFlipbookEl) return;

      let section = currentFlipbookEl.closest('section');
      
      section.find('.flipbook-overlay').fadeOut();
      section.find('.exit-button').fadeOut();
      section.find('.book-display-wrapper').fadeIn();
      
      $('.snap-container').css('overflow', 'auto');
      $('#navbar').css('right', '0');
      
      currentFlipbookEl = null;
  });

  // --- KEYBOARD & RESIZE EVENTS ---
  $(window).resize(function() {
      if (currentFlipbookEl && currentFlipbookEl.is(":visible")) {
          let dims = getBookDimensions();
          currentFlipbookEl.turn('size', dims.width, dims.height);
      }
  });

  $(document).keydown(function(e) {
      if (currentFlipbookEl) {
          switch(e.keyCode) {
              case 37: currentFlipbookEl.turn('previous'); break; 
              case 39: currentFlipbookEl.turn('next'); break;     
              case 27: $('.exit-button').first().click(); break; // ESC triggers close
          }
      }
  });
  
  // --- HAMBURGER MENU ---
  $('.hamburger-menu').click(function(e) {
      e.stopPropagation();
      let nav = $('#navbar');
      if (nav.css('right') === '0px') {
          nav.css('right', '-100vw');
      } else {
          nav.css('right', '0px');
      }
  });
  
  // --- PARALLAX ---
  const heroWrap = document.querySelector(".hero-wrap");
  if(heroWrap) {
      heroWrap.addEventListener("mousemove", function(event) {
          this.querySelectorAll(".parallax-layer").forEach((shift) => {
              const position = shift.getAttribute("value");
              const x = (window.innerWidth - event.pageX * position) / 90;
              const y = (window.innerHeight - event.pageY * position) / 90;
              shift.style.transform = `translateX(${x}px) translateY(${y}px)`;
          });
      });
  }

});
