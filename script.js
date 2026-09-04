/* ================================================================
   SEDIKANA ATTORNEYS INC — Main JavaScript
   Features: Loader, Navbar scroll, Hamburger, Smooth scroll,
             Scroll reveal, Stats counter, Contact form, Back-to-top
================================================================ */

'use strict';

/* ── DOM references ── */
const loader      = document.getElementById('loader');
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');
const backToTop   = document.getElementById('backToTop');
const yearEl      = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const reveals     = document.querySelectorAll('.reveal');
const statNums    = document.querySelectorAll('.statsbar__num');

/* ================================================================
   1. LOADING SCREEN
================================================================ */
window.addEventListener('load', () => {
  // Give the animation a moment to finish, then hide
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 1900);
});

// Prevent scroll while loading
document.body.style.overflow = 'hidden';

/* ================================================================
   2. YEAR — auto-updates in footer
================================================================ */
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ================================================================
   3. STICKY NAVBAR
================================================================ */
const handleNavScroll = () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on init

/* ================================================================
   4. HAMBURGER MENU
================================================================ */
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close drawer on link click
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ================================================================
   5. SMOOTH SCROLL — for anchor links
================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 80;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
});

/* ================================================================
   6. BACK TO TOP BUTTON
================================================================ */
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ================================================================
   7. SCROLL REVEAL — Intersection Observer
================================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Small stagger for sibling reveals
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children).filter(c => c.classList.contains('reveal'))
          : [];
        const sibIndex = siblings.indexOf(entry.target);
        const delay = sibIndex > 0 ? sibIndex * 80 : 0;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

reveals.forEach(el => revealObserver.observe(el));

/* ================================================================
   8. STATS COUNTER ANIMATION
================================================================ */

/* ---- 8a. "Cases Handled" weekly auto-increment ----
   The Cases Handled figure grows by +1 every 7 days, counted from
   CASES_START_DATE. Adjust CASES_START_DATE and CASES_BASE_COUNT
   below if you want to re-anchor the count (e.g. to the day the
   site first went live, or to your actual current case count). */
const CASES_BASE_COUNT  = 500;
const CASES_START_DATE  = new Date('2026-09-04T00:00:00'); // anchor date — edit as needed

function getWeeklyIncrementedCount(baseCount, startDate) {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const weeksElapsed = Math.max(0, Math.floor((now - startDate) / MS_PER_WEEK));
  return baseCount + weeksElapsed;
}

// Find the "Cases Handled" stat and refresh its data-count with the
// current auto-incremented value before the counter animation runs.
document.querySelectorAll('.statsbar__item').forEach(item => {
  const label = item.querySelector('p');
  const numEl = item.querySelector('.statsbar__num');
  if (label && numEl && /cases handled/i.test(label.textContent)) {
    const currentCount = getWeeklyIncrementedCount(CASES_BASE_COUNT, CASES_START_DATE);
    numEl.setAttribute('data-count', currentCount);
  }
});

let countersStarted = false;

const startCounters = () => {
  if (countersStarted) return;
  countersStarted = true;

  statNums.forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000; // ms
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
};

// Trigger counters when stats bar is in view
const statsBar = document.querySelector('.statsbar');
if (statsBar) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        startCounters();
        statsObserver.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  statsObserver.observe(statsBar);
}


/* ================================================================
   9. CONTACT FORM HANDLING
================================================================ */
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name    = contactForm.querySelector('#name').value.trim();
    const email   = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    // Basic validation
    if (!name || !email || !message) {
      showFeedback('error', 'Please fill in all required fields (Name, Email, Message).');
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback('error', 'Please enter a valid email address.');
      return;
    }

    // Simulate submission (replace with real endpoint / mailto / formspree)
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      showFeedback('success', `Thank you, ${name}! Your message has been received. We will contact you shortly.`);
      contactForm.reset();
    }, 1600);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFeedback(type, message) {
  formFeedback.className = `form__feedback ${type}`;
  formFeedback.textContent = message;
  formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-hide success after 8 seconds
  if (type === 'success') {
    setTimeout(() => {
      formFeedback.className = 'form__feedback';
      formFeedback.textContent = '';
    }, 8000);
  }
}

/* ================================================================
   10. ACTIVE NAV LINK HIGHLIGHT — on scroll
================================================================ */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.navbar__menu a, .mobile-menu a');

const activeLinkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.slice(1) === entry.target.id) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
    });
  },
  { threshold: 0.35, rootMargin: '-80px 0px -50% 0px' }
);

sections.forEach(section => activeLinkObserver.observe(section));

/* ================================================================
   11. SERVICE CARD — touch device fallback
   (ensures hover effect triggers on tap for mobile users)
================================================================ */
if ('ontouchstart' in window) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('touchstart', function() {
      this.classList.toggle('touched');
    }, { passive: true });
  });
}

/* ================================================================
   12. HERO PARALLAX — subtle scroll depth effect
================================================================ */
const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(min-width: 769px)').matches) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.backgroundPositionY = `calc(50% + ${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}