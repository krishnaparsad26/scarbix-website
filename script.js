/* ============================================================
   POWERING CARBON MARKET — script.js
   Features:
   1. Sticky navbar with scroll detection
   2. Mobile hamburger menu + overlay
   3. Smooth scrolling for nav links
   4. Scroll-reveal animations (IntersectionObserver)
   5. JavaScript image/content slider with dots
   6. Contact form interactivity (validation + success state)
   7. Hover ripple effect on primary buttons
============================================================ */

'use strict';

/* ── Utility: wait for DOM ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────────────────
     1. STICKY NAVBAR
     Adds `.scrolled` class after user scrolls past 60px.
     This triggers the white background + shadow in CSS.
  ───────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run on load in case of refresh mid-page


  /* ────────────────────────────────────────────────────────
     2. MOBILE HAMBURGER MENU
     Toggles the slide-out nav panel and adds an overlay.
     Closes when user clicks the overlay or a nav link.
  ───────────────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Create and append overlay element dynamically
  const overlay = document.createElement('div');
  overlay.classList.add('nav-overlay');
  document.body.appendChild(overlay);

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close menu when overlay is clicked
  overlay.addEventListener('click', closeMenu);

  // Close menu when any nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* ────────────────────────────────────────────────────────
     3. SMOOTH SCROLLING
     Intercepts clicks on anchor links (#section) and
     scrolls smoothly, offsetting for the fixed navbar.
  ───────────────────────────────────────────────────────── */
  const NAVBAR_HEIGHT = 75; // px offset so content isn't hidden under navbar

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // skip empty hashes

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });


  /* ────────────────────────────────────────────────────────
     4. SCROLL-REVEAL ANIMATIONS
     Adds `.reveal` class to elements and uses
     IntersectionObserver to trigger `.visible` when
     they enter the viewport.
  ───────────────────────────────────────────────────────── */
  const revealSelectors = [
    '.about-grid',
    '.service-card',
    '.step',
    '.contact-grid',
    '.section-header',
    '.pillar',
    '.hero-stats'
  ];

  // Add `.reveal` class to all target elements
  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  // Create observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards/steps with a small delay
        const delay = entry.target.dataset.revealDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target); // only animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // Add staggered delays for grid children
  document.querySelectorAll('.services-grid .service-card').forEach((el, i) => {
    el.dataset.revealDelay = i * 120;
  });
  document.querySelectorAll('.steps-track .step').forEach((el, i) => {
    el.dataset.revealDelay = i * 100;
  });

  // Observe all elements with `.reveal`
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ────────────────────────────────────────────────────────
     5. IMAGE / CONTENT SLIDER
     Simple manual slider:
     - Tracks currentSlide index
     - Moves the slider-track with CSS transform
     - Generates dot indicators dynamically
     - Auto-advances every 6 seconds
     - Pauses autoplay on hover
  ───────────────────────────────────────────────────────── */
  const sliderTrack    = document.getElementById('sliderTrack');
  const sliderViewport = document.getElementById('sliderViewport');
  const prevBtn        = document.getElementById('prevBtn');
  const nextBtn        = document.getElementById('nextBtn');
  const dotsContainer  = document.getElementById('sliderDots');

  if (sliderTrack && sliderViewport) {
    const slides      = sliderTrack.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let   currentSlide = 0;
    let   autoplayTimer;

    // ── Build dot indicators ──
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    // ── Core: move to a given slide index ──
    function goToSlide(index) {
      // Wrap around (circular)
      if (index < 0)           index = totalSlides - 1;
      if (index >= totalSlides) index = 0;

      currentSlide = index;

      // Translate the track
      sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Update dots
      dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    // ── Button listeners ──
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      resetAutoplay();
    });

    // ── Keyboard navigation ──
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goToSlide(currentSlide - 1); resetAutoplay(); }
      if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); resetAutoplay(); }
    });

    // ── Touch / swipe support ──
    let touchStartX = 0;
    sliderViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    sliderViewport.addEventListener('touchend', (e) => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) { // minimum swipe distance
        delta > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
        resetAutoplay();
      }
    }, { passive: true });

    // ── Autoplay: advance every 6s ──
    function startAutoplay() {
      autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    // Pause on hover
    sliderViewport.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    sliderViewport.addEventListener('mouseleave', startAutoplay);

    // Init autoplay
    startAutoplay();
  }


  /* ────────────────────────────────────────────────────────
     6. CONTACT FORM INTERACTIVITY
     - Basic client-side validation
     - Visual error states
     - Success message on submit
     - Button loading state
  ───────────────────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn   = document.getElementById('submitBtn');
  
  if (contactForm) {

  // Real-time validation on blur
  contactForm.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('input-error')) validateField(field);
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear old errors
    contactForm.querySelectorAll('.field-error').forEach(el => el.remove());
    contactForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    // Validate all required fields
    let hasErrors = false;
    contactForm.querySelectorAll('[required]').forEach(field => {
      if (!validateField(field)) hasErrors = true;
    });
    if (hasErrors) return;

    // Check honeypot (bot protection)
    const honeypot = contactForm.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return; // silently abort if bot

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Success — hide form, show message
        contactForm.querySelectorAll('.form-group, .form-row').forEach(el => el.style.display = 'none');
        submitBtn.style.display = 'none';
        formSuccess.classList.add('show');
        contactForm.reset();
      } else {
        // Server error
        const data = await response.json().catch(() => ({}));
        const msg  = (data.errors || []).map(e => e.message).join(', ') || 'Something went wrong. Please email us directly.';
        showFormError(msg);
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Message';
      }

    } catch (err) {
      // Network error
      showFormError('Network error. Please check your connection or email hello@scarbix.com');
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
    }
  });

  function validateField(field) {
    const value = field.value.trim();
    let   msg   = '';

    if (field.hasAttribute('required') && !value) {
      msg = 'This field is required.';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
      msg = 'Please enter a valid email address.';
    }

    if (msg) {
      field.classList.add('input-error');
      let errEl = field.parentNode.querySelector('.field-error');
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.classList.add('field-error');
        errEl.style.cssText = 'color:#c0392b;font-size:.8rem;margin-top:.2rem;';
        field.parentNode.appendChild(errEl);
      }
      errEl.textContent = msg;
      return false;
    } else {
      field.classList.remove('input-error');
      const errEl = field.parentNode.querySelector('.field-error');
      if (errEl) errEl.remove();
      return true;
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function showFormError(msg) {
    let errDiv = contactForm.querySelector('.form-global-error');
    if (!errDiv) {
      errDiv = document.createElement('div');
      errDiv.className = 'form-global-error';
      errDiv.style.cssText = 'background:#fff0f0;border:1px solid #c0392b;border-radius:6px;padding:.85rem 1rem;color:#c0392b;font-size:.9rem;margin-top:.5rem;';
      submitBtn.insertAdjacentElement('afterend', errDiv);
    }
    errDiv.textContent = msg;
  }
}


  /* ────────────────────────────────────────────────────────
     7. BUTTON RIPPLE EFFECT
     Creates a circular ripple animation on `.btn-primary`
     clicks — gives a satisfying tactile feel.
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn-primary').forEach(btn => {

    // Make sure button has position:relative for ripple positioning
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function (e) {
      // Remove any existing ripple
      const existing = this.querySelector('.ripple');
      if (existing) existing.remove();

      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.5;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        transform: scale(0);
        animation: rippleAnim .6s linear;
        pointer-events: none;
      `;
      this.appendChild(ripple);

      // Remove ripple element after animation
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Inject ripple keyframe into document
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);


  /* ────────────────────────────────────────────────────────
     8. ACTIVE NAV LINK ON SCROLL
     Highlights the correct nav link based on which
     section is currently in the viewport.
  ───────────────────────────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-links .nav-link:not(.nav-cta)');

  function updateActiveLink() {
    const scrollPos = window.scrollY + NAVBAR_HEIGHT + 80;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        allNavLinks.forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }

  // Add active-link style
  const activeLinkStyle = document.createElement('style');
  activeLinkStyle.textContent = `.active-link { color: var(--clr-leaf) !important; } .active-link::after { width: 100% !important; }`;
  document.head.appendChild(activeLinkStyle);

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // run on load

}); // end DOMContentLoaded
