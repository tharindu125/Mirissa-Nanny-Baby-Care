/**
 * Mirissa Nanny & Baby Care — Main JavaScript
 */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '94743385282';
  const BUSINESS_NAME = 'Mirissa Nanny & Baby Care';

  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function getWhatsAppUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  /* --- Header Scroll --- */
  function initHeader() {
    const header = $('.header');
    if (!header) return;

    const isHome = document.body.classList.contains('page-home');
    const hero = $('.hero') || $('.page-hero');

    function updateHeader() {
      const scrollY = window.scrollY;
      const threshold = hero ? hero.offsetHeight * 0.12 : 50;

      if (isHome && scrollY < threshold) {
        header.classList.add('transparent');
        header.classList.remove('scrolled');
      } else {
        header.classList.remove('transparent');
        header.classList.add('scrolled');
      }
    }

    if (isHome) {
      header.classList.add('transparent');
    } else {
      header.classList.add('scrolled');
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* --- Mobile Navigation --- */
  function initMobileNav() {
    const hamburger = $('.hamburger');
    const mobileNav = $('.mobile-nav');
    const overlay = $('.mobile-nav-overlay');

    if (!hamburger || !mobileNav) return;

    function toggleNav(open) {
      hamburger.classList.toggle('active', open);
      mobileNav.classList.toggle('open', open);
      if (overlay) overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => {
      toggleNav(!mobileNav.classList.contains('open'));
    });

    if (overlay) {
      overlay.addEventListener('click', () => toggleNav(false));
    }

    $$('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => toggleNav(false));
    });
  }

  /* --- Scroll Animations --- */
  function initScrollAnimations() {
    const elements = $$('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  /* --- Back To Top --- */
  function initBackToTop() {
    const btn = $('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Smooth Scroll --- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const target = $(id);
        if (target) {
          e.preventDefault();
          const offset = $('.header') ? $('.header').offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Gallery Lightbox --- */
  function initLightbox() {
    const galleryItems = $$('.gallery-item');
    const lightbox = $('.lightbox');
    if (!galleryItems.length || !lightbox) return;

    const lightboxImg = $('img', lightbox);
    const closeBtn = $('.lightbox-close', lightbox);
    const prevBtn = $('.lightbox-prev', lightbox);
    const nextBtn = $('.lightbox-next', lightbox);

    const images = galleryItems.map(item => ({
      src: $('img', item).src,
      alt: $('img', item).alt
    }));

    let currentIndex = 0;

    function open(index) {
      currentIndex = index;
      updateImage();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function updateImage() {
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }

    function next() {
      currentIndex = (currentIndex + 1) % images.length;
      updateImage();
    }

    function prev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateImage();
    }

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => open(i));
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  /* --- FAQ Accordion --- */
  function initFAQ() {
    $$('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        $$('.faq-item').forEach(i => i.classList.remove('open'));

        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* --- Calendar Widget --- */
  let selectedDate = null;
  let calendarMonth = new Date().getMonth();
  let calendarYear = new Date().getFullYear();

  function initCalendar() {
    const widget = $('#booking-calendar');
    if (!widget) return;

    const trigger = $('#date-trigger');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate = new Date(today);

    renderCalendar(widget);
    updateTriggerText();

    $('#cal-prev', widget)?.addEventListener('click', () => {
      calendarMonth--;
      if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
      }
      renderCalendar(widget);
    });

    $('#cal-next', widget)?.addEventListener('click', () => {
      calendarMonth++;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      }
      renderCalendar(widget);
    });

    trigger?.addEventListener('click', () => {
      if (widget.hidden) {
        openCalendarPopup();
      } else {
        closeCalendarPopup();
      }
    });

    document.addEventListener('click', (e) => {
      if (widget.hidden) return;
      if (widget.contains(e.target) || trigger?.contains(e.target)) return;
      closeCalendarPopup();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !widget.hidden) closeCalendarPopup();
    });
  }

  function openCalendarPopup() {
    const widget = $('#booking-calendar');
    const trigger = $('#date-trigger');
    if (!widget || !trigger) return;
    widget.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeCalendarPopup() {
    const widget = $('#booking-calendar');
    const trigger = $('#date-trigger');
    if (!widget || !trigger) return;
    widget.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function updateTriggerText() {
    const trigger = $('#date-trigger');
    const label = $('#date-trigger-text');
    if (!trigger || !label || !selectedDate) return;
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    label.textContent = selectedDate.toLocaleDateString('en-GB', options);
    trigger.classList.add('has-value');
  }

  function renderCalendar(widget) {
    const daysContainer = $('#calendar-days', widget);
    const monthLabel = $('#calendar-month', widget);
    const selectedLabel = $('#calendar-selected', widget);

    if (!daysContainer || !monthLabel) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthLabel.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    daysContainer.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('button');
      empty.className = 'calendar-day empty';
      empty.disabled = true;
      daysContainer.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';
      btn.textContent = day;

      const date = new Date(calendarYear, calendarMonth, day);
      date.setHours(0, 0, 0, 0);

      if (date < today) {
        btn.classList.add('past');
        btn.disabled = true;
      }

      if (date.getTime() === today.getTime()) {
        btn.classList.add('today');
      }

      if (selectedDate &&
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        selectedDate = date;
        renderCalendar(widget);
        updateSelectedLabel(selectedLabel);
        updateTriggerText();
        clearCalendarError();
        closeCalendarPopup();
      });

      daysContainer.appendChild(btn);
    }

    updateSelectedLabel(selectedLabel);
  }

  function updateSelectedLabel(label) {
    if (!label || !selectedDate) return;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    label.textContent = `Selected: ${selectedDate.toLocaleDateString('en-GB', options)}`;
  }

  function formatSelectedDate() {
    if (!selectedDate) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return selectedDate.toLocaleDateString('en-GB', options);
  }

  function clearCalendarError() {
    const err = $('.calendar-error');
    if (err) err.remove();
  }

  /* --- Toast --- */
  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* --- Booking Form --- */
  function buildBookingMessage() {
    const form = $('#booking-form');
    if (!form) return '';

    const name = $('#book-name', form)?.value.trim() || '';
    const phone = $('#book-phone', form)?.value.trim() || '';
    const email = $('#book-email', form)?.value.trim() || '';
    const children = $('#book-children', form)?.value || '';
    const notes = $('#book-notes', form)?.value.trim() || 'None';

    const services = $$('input[name="services"]:checked', form).map(cb => cb.value);
    const servicesText = services.length ? services.join(', ') : 'Not specified';

    return `Hello ${BUSINESS_NAME}, I would like to book a service.

Services: ${servicesText}
Date: ${formatSelectedDate()}
Number of children: ${children}
Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Notes: ${notes}

Please confirm availability. Thank you!`;
  }

  function validateBookingForm(form) {
    let valid = true;

    $$('.field-error', form).forEach(el => el.remove());

    const services = $$('input[name="services"]:checked', form);
    if (!services.length) {
      showFieldError($('.checkbox-group', form), 'Please select at least one service');
      valid = false;
    }

    if (!selectedDate) {
      const calWidget = $('#booking-calendar');
      if (calWidget) {
        showFieldError(calWidget, 'Please select a date');
      }
      valid = false;
    }

    const requiredFields = [
      { el: $('#book-name', form), msg: 'Name is required' },
      { el: $('#book-phone', form), msg: 'Phone number is required' },
      { el: $('#book-children', form), msg: 'Please select number of children' }
    ];

    requiredFields.forEach(({ el, msg }) => {
      if (el && !el.value.trim()) {
        showFieldError(el, msg);
        valid = false;
      }
    });

    const email = $('#book-email', form);
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showFieldError(email, 'Please enter a valid email');
      valid = false;
    }

    return valid;
  }

  function showFieldError(fieldOrGroup, message) {
    const error = document.createElement('span');
    error.className = 'field-error';
    if (fieldOrGroup.classList?.contains('calendar-widget')) {
      error.classList.add('calendar-error');
    }
    error.textContent = message;

    if (fieldOrGroup.tagName === 'INPUT' || fieldOrGroup.tagName === 'SELECT' || fieldOrGroup.tagName === 'TEXTAREA') {
      fieldOrGroup.style.borderColor = '#e74c3c';
      fieldOrGroup.parentNode.appendChild(error);
    } else {
      fieldOrGroup.parentNode.appendChild(error);
    }
  }

  function initBookingForm() {
    const form = $('#booking-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      $$('#booking-form input, #booking-form select', form).forEach(f => {
        if (f.style) f.style.borderColor = '';
      });
      clearCalendarError();

      if (!validateBookingForm(form)) return;

      const message = buildBookingMessage();

      try {
        await navigator.clipboard.writeText(message);
        showToast('Details copied! Opening WhatsApp…');
      } catch {
        showToast('Opening WhatsApp — paste your details to send.');
      }

      setTimeout(() => {
        window.open(getWhatsAppUrl(message), '_blank');
      }, 600);
    });
  }

  /* --- Floating Icons (Global) --- */
  function initFloatingIcons() {
    const icons = [
      '✈️', '🎵', '⭐', '💛', '☀️', '🎈', '🌈', '☁️', '🧸', '🎀',
      '🦋', '🌸', '💕', '🎪', '🎨', '🌟', '👶', '🎁', '🍭', '🎠'
    ];

    const positions = [
      { top: '8%',  left: '4%'  },
      { top: '15%', right: '6%' },
      { top: '28%', left: '10%' },
      { top: '42%', right: '12%' },
      { top: '55%', left: '3%'  },
      { top: '68%', right: '8%' },
      { top: '22%', left: '22%' },
      { top: '75%', left: '18%' },
      { top: '12%', right: '20%' },
      { top: '48%', right: '3%'  },
      { top: '62%', left: '28%' },
      { top: '85%', right: '22%' }
    ];

    if (!$('.site-float-decor')) {
      const globalDecor = document.createElement('div');
      globalDecor.className = 'site-float-decor';
      globalDecor.setAttribute('aria-hidden', 'true');

      positions.forEach((pos, i) => {
        const span = document.createElement('span');
        span.className = `site-float site-float-${i + 1}`;
        span.textContent = icons[i % icons.length];
        span.style.top = pos.top;
        span.style.left = pos.left || '';
        span.style.right = pos.right || '';
        span.style.animationDelay = `${i * 0.45}s`;
        globalDecor.appendChild(span);
      });

      document.body.appendChild(globalDecor);
    }

    const sectionPositions = [
      { top: '12%', left: '6%' },
      { top: '8%',  right: '8%' },
      { top: '45%', left: '4%' },
      { top: '55%', right: '5%' },
      { top: '78%', left: '12%' },
      { top: '70%', right: '10%' },
      { top: '30%', left: '15%' },
      { top: '35%', right: '15%' }
    ];

    $$('main section').forEach((section, sectionIdx) => {
      if (section.querySelector('.section-float-decor')) return;
      if (section.classList.contains('hero') || section.classList.contains('hero-carousel')) return;
      if (section.classList.contains('section-services') && section.querySelector('.services-decor')) return;

      const decor = document.createElement('div');
      decor.className = 'section-float-decor';
      decor.setAttribute('aria-hidden', 'true');

      const count = section.classList.contains('page-hero') ? 6 : 8;

      for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = `section-float section-float-${i + 1}`;
        const iconIdx = (sectionIdx * 5 + i) % icons.length;
        const pos = sectionPositions[i % sectionPositions.length];
        span.textContent = icons[iconIdx];
        span.style.top = pos.top;
        if (pos.left) span.style.left = pos.left;
        if (pos.right) span.style.right = pos.right;
        span.style.animationDelay = `${(sectionIdx * 0.35 + i * 0.55)}s`;
        span.style.fontSize = `${2 + (i % 3) * 0.4}rem`;
        decor.appendChild(span);
      }

      section.insertBefore(decor, section.firstChild);

      if (section.classList.contains('page-hero')) {
        const content = $('.page-hero-content', section);
        if (content) content.style.position = 'relative';
        if (content) content.style.zIndex = '2';
      }
    });
  }

  /* --- Initialize --- */
  function init() {
    initHeader();
    initMobileNav();
    initScrollAnimations();
    initBackToTop();
    initSmoothScroll();
    initLightbox();
    initFAQ();
    initCalendar();
    initBookingForm();
    initFloatingIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
