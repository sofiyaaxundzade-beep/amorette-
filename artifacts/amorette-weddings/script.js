/* AMORETTE WEDDINGS — small, dependency-free interactions. */
const nav = document.querySelector('.site-nav');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');
const backTop = document.querySelector('.back-top');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScrollChrome() {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  backTop.classList.toggle('visible', window.scrollY > 500);
}
window.addEventListener('scroll', updateScrollChrome, { passive: true });
updateScrollChrome();

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  menu.classList.remove('open');
  document.body.classList.remove('is-locked');
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  menu.classList.toggle('open', !isOpen);
  document.body.classList.toggle('is-locked', !isOpen);
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => {
  if (window.innerWidth > 850) closeMenu();
});
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' }));

// Reveal content only when it enters the viewport; reduced-motion users see it immediately.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('in-view'));
}

// Portfolio lightbox: supports buttons, keyboard navigation, focus restoration and looping.
const galleryButtons = [...document.querySelectorAll('.gallery-item')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('figcaption');
const lightboxCount = lightbox.querySelector('.lightbox-count');
const closeLightboxButton = lightbox.querySelector('.lightbox-close');
let activeImageIndex = 0;
let lastFocusedElement = null;

function showImage(index) {
  activeImageIndex = (index + galleryButtons.length) % galleryButtons.length;
  const card = galleryButtons[activeImageIndex];
  const image = card.querySelector('img');
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = card.querySelector('.gallery-caption').textContent;
  lightboxCount.textContent = `${String(activeImageIndex + 1).padStart(2, '0')} / ${String(galleryButtons.length).padStart(2, '0')}`;
}
function openLightbox(index) {
  lastFocusedElement = document.activeElement;
  showImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  closeLightboxButton.focus();
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}
galleryButtons.forEach((button) => button.addEventListener('click', () => openLightbox(Number(button.dataset.index))));
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeImageIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeImageIndex + 1));
closeLightboxButton.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('open')) {
    if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    return;
  }
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowRight') showImage(activeImageIndex + 1);
  if (event.key === 'ArrowLeft') showImage(activeImageIndex - 1);
  if (event.key === 'Tab') {
    const focusable = [...lightbox.querySelectorAll('button')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// Testimonial selector.
const quotes = [...document.querySelectorAll('.quote')];
const quoteDots = [...document.querySelectorAll('.quote-dot')];
quoteDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const selected = Number(dot.dataset.quote);
    quotes.forEach((quote, index) => quote.classList.toggle('active', index === selected));
    quoteDots.forEach((item, index) => item.setAttribute('aria-current', String(index === selected)));
  });
});

// The form intentionally stays in the browser. It validates, reports errors accessibly,
// and tells visitors clearly that no message has been sent or stored.
const form = document.querySelector('#inquiry-form');
const formStatus = document.querySelector('#form-status');
const validationRules = [
  { name: 'fullName', id: 'full-name', label: 'Please enter your full name.' },
  { name: 'email', id: 'email', label: 'Please enter a valid email address.', test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
  { name: 'phone', id: 'phone', label: 'Please enter a valid phone number.', test: (value) => /^[+()\d\s.-]{7,}$/.test(value) },
  { name: 'weddingDate', id: 'wedding-date', label: 'Please choose your wedding date.' },
  { name: 'location', id: 'location', label: 'Please enter your wedding location.' },
  { name: 'guestCount', id: 'guests', label: 'Please choose an approximate guest count.' },
  { name: 'budget', id: 'budget', label: 'Please choose your wedding budget.' },
  { name: 'style', id: 'style', label: 'Please choose your preferred wedding style.' },
  { name: 'message', id: 'message', label: 'Please share a little about your plans.' },
];
function validateField(rule) {
  const field = form.elements.namedItem(rule.name);
  const value = field.value.trim();
  let error = '';
  if (!value && !rule.optional) error = rule.label;
  else if (value && rule.test && !rule.test(value)) error = rule.label;
  field.setAttribute('aria-invalid', String(Boolean(error)));
  document.querySelector(`#error-${rule.id}`).textContent = error;
  return !error;
}
validationRules.forEach((rule) => {
  const field = form.elements.namedItem(rule.name);
  field.addEventListener('blur', () => validateField(rule));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(rule);
  });
  field.addEventListener('change', () => validateField(rule));
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.classList.remove('visible');
  const valid = validationRules.map(validateField).every(Boolean);
  if (!valid) {
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  formStatus.innerHTML = '<strong>Your inquiry is prepared in this browser.</strong>Your information has been validated here only. It has <b>not been sent, delivered, or stored</b> because no backend or email integration is connected.';
  formStatus.classList.add('visible');
  formStatus.focus();
});

