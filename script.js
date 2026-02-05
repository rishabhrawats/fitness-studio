(() => {
  const root = document.documentElement;
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu?.classList.toggle('open');
  });

  // Active nav based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  // Theme toggle + persistence
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? 'SUN' : 'MOON';
  };
  applyTheme(localStorage.getItem('theme') || 'light');
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Reveal observers
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  if (!reduceMotion) {
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  // Schedule filter
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const scheduleCards = [...document.querySelectorAll('.schedule-card')];
  if (filterButtons.length && scheduleCards.length) {
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
  }

  // Counters
  const counters = [...document.querySelectorAll('.counter')];
  const resultsSection = document.getElementById('results');
  if (counters.length && resultsSection) {
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
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counterDone) {
        counters.forEach(runCounter);
        counterDone = true;
      }
    }, { threshold: 0.35 });
    counterObserver.observe(resultsSection);
  }

  // Before/after slider
  const compareSlider = document.getElementById('transformSlider');
  const afterPanel = document.getElementById('afterPanel');
  compareSlider?.addEventListener('input', () => {
    if (afterPanel) afterPanel.style.width = `${compareSlider.value}%`;
  });

  // Testimonials slider + keyboard
  const testimonials = [...document.querySelectorAll('.testimonial')];
  let index = 0;
  const slidesWrap = document.querySelector('.slides');
  const showTestimonial = (nextIndex) => {
    index = (nextIndex + testimonials.length) % testimonials.length;
    testimonials.forEach((slide, i) => slide.classList.toggle('active', i === index));
  };
  if (testimonials.length) {
    document.querySelector('.prev')?.addEventListener('click', () => showTestimonial(index - 1));
    document.querySelector('.next')?.addEventListener('click', () => showTestimonial(index + 1));
    slidesWrap?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') showTestimonial(index + 1);
      if (e.key === 'ArrowLeft') showTestimonial(index - 1);
    });
  }

  // Form validation
  const form = document.getElementById('leadForm');
  const success = document.getElementById('formSuccess');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\-\s\d]{7,}$/;

  const setError = (name, message = '') => {
    const error = document.querySelector(`.error[data-for="${name}"]`);
    const field = form?.elements[name];
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

    if (name.length < 2) {
      setError('name', 'Please enter your full name.');
      valid = false;
    } else {
      setError('name');
    }
    if (!emailPattern.test(email)) {
      setError('email', 'Enter a valid email address.');
      valid = false;
    } else {
      setError('email');
    }
    if (!phonePattern.test(phone)) {
      setError('phone', 'Enter a valid phone number.');
      valid = false;
    } else {
      setError('phone');
    }
    ['goal', 'time'].forEach((f) => {
      if (!data.get(f)) {
        setError(f, 'Please choose an option.');
        valid = false;
      } else {
        setError(f);
      }
    });

    if (valid) {
      success?.removeAttribute('hidden');
      form.reset();
      setTimeout(() => {
        success?.setAttribute('hidden', 'true');
      }, 4000);
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
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Year injection
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
