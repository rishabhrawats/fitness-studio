(() => {
  const config = {
    brandName: "Apex Performance Studio",
    trainerName: "Jordan Reyes",
  };

  const root = document.documentElement;
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('main section')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });

  // Theme toggle + persistence
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  applyTheme(localStorage.getItem('theme') || 'light');
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Active nav + reveal observers
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { threshold: 0.45 });
  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  if (!reduceMotion) document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  else document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));

  // Services modal + focus trap
  const modalDetails = {
    pt: 'Precision one-on-one coaching with movement analysis and progression tracking.',
    sc: 'Periodized programming designed to increase strength, speed, and work capacity.',
    fl: 'A practical, sustainable fat loss framework with personalized nutrition targets.',
    mr: 'Targeted mobility routines and recovery protocols to keep you pain-free and resilient.',
    gc: 'Small-group sessions with high coaching attention and performance-based progressions.',
    nc: 'Habit-based nutrition coaching with weekly accountability and flexible meal frameworks.',
  };
  const overlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.querySelector('.modal-close');
  let lastFocus;

  const openModal = (key, title) => {
    lastFocus = document.activeElement;
    modalTitle.textContent = title;
    modalContent.textContent = modalDetails[key] || '';
    overlay.hidden = false;
    modal.focus();
  };
  const closeModal = () => {
    overlay.hidden = true;
    lastFocus?.focus();
  };

  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal, btn.closest('.card').querySelector('h3').textContent));
  });

  modalClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (!overlay.hidden && e.key === 'Escape') closeModal();
    if (!overlay.hidden && e.key === 'Tab') {
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Schedule filter
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const scheduleCards = [...document.querySelectorAll('.schedule-card')];
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      const day = button.dataset.day;
      scheduleCards.forEach((card) => {
        const show = day === 'all' || card.dataset.day === day;
        card.hidden = !show;
      });
    });
  });

  // Counters
  const counters = [...document.querySelectorAll('.counter')];
  const runCounter = (counter) => {
    const target = Number(counter.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const tick = () => {
      current += step;
      if (current >= target) current = target;
      counter.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  };
  let counterDone = false;
  const resultsSection = document.getElementById('results');
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !counterDone) {
      counters.forEach(runCounter);
      counterDone = true;
    }
  }, { threshold: 0.35 });
  counterObserver.observe(resultsSection);

  // Before/after slider
  const compareSlider = document.getElementById('transformSlider');
  const afterPanel = document.getElementById('afterPanel');
  compareSlider?.addEventListener('input', () => {
    afterPanel.style.width = `${compareSlider.value}%`;
  });

  // Testimonials slider + keyboard
  const testimonials = [...document.querySelectorAll('.testimonial')];
  let index = 0;
  const slidesWrap = document.querySelector('.slides');
  const showTestimonial = (nextIndex) => {
    index = (nextIndex + testimonials.length) % testimonials.length;
    testimonials.forEach((slide, i) => slide.classList.toggle('active', i === index));
  };
  document.querySelector('.prev')?.addEventListener('click', () => showTestimonial(index - 1));
  document.querySelector('.next')?.addEventListener('click', () => showTestimonial(index + 1));
  slidesWrap?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showTestimonial(index + 1);
    if (e.key === 'ArrowLeft') showTestimonial(index - 1);
  });

  // Form validation
  const form = document.getElementById('leadForm');
  const success = document.getElementById('formSuccess');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\-\s\d]{7,}$/;

  const setError = (name, message = '') => {
    const error = document.querySelector(`.error[data-for="${name}"]`);
    const field = form.elements[name];
    if (error) error.textContent = message;
    field?.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const data = new FormData(form);
    const name = data.get('name').toString().trim();
    const email = data.get('email').toString().trim();
    const phone = data.get('phone').toString().trim();

    if (name.length < 2) { setError('name', 'Please enter your full name.'); valid = false; } else setError('name');
    if (!emailPattern.test(email)) { setError('email', 'Enter a valid email address.'); valid = false; } else setError('email');
    if (!phonePattern.test(phone)) { setError('phone', 'Enter a valid phone number.'); valid = false; } else setError('phone');
    ['goal', 'time'].forEach((f) => {
      if (!data.get(f)) { setError(f, 'Please choose an option.'); valid = false; }
      else setError(f);
    });

    if (valid) {
      success.hidden = false;
      form.reset();
      setTimeout(() => { success.hidden = true; }, 4000);
    }
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  // Back to top
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 700);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Brand config injection
  document.title = `${config.brandName} | ${config.trainerName}`;
})();
