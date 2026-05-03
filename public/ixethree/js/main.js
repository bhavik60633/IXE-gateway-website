/* ==============================================
   IXE GATEWAY - MAIN JAVASCRIPT
   Navigation, Animations, Forms, WhatsApp
   ============================================== */

// *** UPDATE THIS NUMBER before going live ***
const WHATSAPP_NUMBER = '919999999999';
const WHATSAPP_MESSAGE = 'Hello IXE Gateway, I am interested in your Makhana export products. Please share more details.';

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initScrollReveal();
  initCounters();
  initForms();
  initWhatsApp();
  initTiltCards();
  setActivePage();
});

// ---- Navigation ----
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  // Include .btn so "Get Quote" also closes the mobile menu
  const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link, .mobile-menu .btn');

  if (!navbar) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      if (mobileMenu) {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      }
    });
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (hamburger) hamburger.classList.remove('open');
      if (mobileMenu) mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Set active nav link based on current page ----
function setActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html') || (currentPage === 'index.html' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

// ---- Scroll Reveal ----
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }
}

// ---- Counter Animation ----
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---- Form Validation ----
function validateForm(form) {
  var errors = [];
  var name    = form.querySelector('[name="name"]');
  var email   = form.querySelector('[name="email"]');
  var country = form.querySelector('[name="country"]');

  // Reset previous error styles
  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.style.borderBottomColor = '';
    el.style.borderColor = '';
  });

  if (name    && !name.value.trim())    errors.push(name);
  if (email   && !email.value.trim())   errors.push(email);
  if (country && !country.value.trim()) errors.push(country);

  // Highlight invalid fields
  errors.forEach(function (el) {
    el.style.borderBottomColor = '#e74c3c';
    el.style.borderColor = '#e74c3c';
    el.focus();
  });
  if (errors.length > 0) errors[0].focus();

  return errors.length === 0;
}

// ---- Form Handling ----
function initForms() {
  const forms = document.querySelectorAll('.enquiry-form-el');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleFormSubmit(form);
    });
  });
}

function handleFormSubmit(form) {
  if (!validateForm(form)) return;

  const btn = form.querySelector('.form-submit');
  const successMsg = form.querySelector('.form-success');
  const originalHTML = btn ? btn.innerHTML : '';

  if (btn) {
    btn.innerHTML = 'Opening WhatsApp&hellip;';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  // Gather form data for WhatsApp message
  const name     = form.querySelector('[name="name"]');
  const email    = form.querySelector('[name="email"]');
  const phone    = form.querySelector('[name="phone"]');
  const country  = form.querySelector('[name="country"]');
  const product  = form.querySelector('[name="product"]');
  const quantity = form.querySelector('[name="quantity"]');
  const message  = form.querySelector('[name="message"]');

  const parts = ['*New Enquiry from IXE Gateway Website*'];
  if (name     && name.value)     parts.push('Name: '             + name.value.trim());
  if (email    && email.value)    parts.push('Email: '            + email.value.trim());
  if (phone    && phone.value)    parts.push('Phone: '            + phone.value.trim());
  if (country  && country.value)  parts.push('Country: '          + country.value.trim());
  if (product  && product.value)  parts.push('Product Interest: ' + product.value);
  if (quantity && quantity.value) parts.push('Quantity: '         + quantity.value);
  if (message  && message.value)  parts.push('Message: '          + message.value.trim());

  const waText = encodeURIComponent(parts.join('\n'));
  const waURL  = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waText;

  setTimeout(function () {
    if (btn) {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.style.opacity = '';
    }

    // Honest message: the enquiry opens WhatsApp; it's sent when user taps Send there
    if (successMsg) {
      successMsg.style.display = 'block';
      successMsg.textContent = '✓ WhatsApp is opening — please tap Send to complete your enquiry.';
    }

    // Clear error highlights and reset form
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.style.borderBottomColor = '';
      el.style.borderColor = '';
    });
    form.reset();

    window.open(waURL, '_blank');

    if (successMsg) {
      setTimeout(function () {
        successMsg.style.display = 'none';
      }, 8000);
    }
  }, 800);
}

// ---- WhatsApp Links (single source of truth) ----
function initWhatsApp() {
  const waURL = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
  document.querySelectorAll('.whatsapp-float, .whatsapp-direct').forEach(function (el) {
    el.href   = waURL;
    el.target = '_blank';
    el.rel    = 'noopener noreferrer';
  });
}

// ---- 3D Tilt Card Effect ----
function initTiltCards() {
  const cards = document.querySelectorAll('.product-card, .feature-card');

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -8;
      const tiltY = dx * 8;
      card.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-6px)';
      card.style.boxShadow = '0 20px 60px rgba(12, 36, 97, 0.2), ' + (-dx * 10) + 'px ' + (-dy * 10) + 'px 20px rgba(212,175,55,0.1)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// ---- Smooth Scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    const href = a.getAttribute('href');
    if (href === '#') return; // let plain # links be (e.g. placeholder social icons)
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
