/* ============================================================
   BELGIUM CAMPUS LECTURER PORTFOLIO — JAVASCRIPT
   Sections: Nav | Particles | Scroll Reveal | Bio Typing |
             Quote Carousel | Superpower Cards | Flip Cards
   ============================================================ */

'use strict';

/* ── Utility: run after DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initParticles();
  initScrollReveal();
  initBioTyping();
  initQuoteCarousel();
  initPowerCards();
  initFlipCards();
  initFooterYear();
});

/* ============================================================
   NAV — sticky scroll + mobile toggle + active links
   ============================================================ */
function initNav() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-links');
  const links   = document.querySelectorAll('.nav-links a');

  /* Scroll: add .scrolled class */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }, { passive: true });

  /* Mobile toggle */
  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* Close mobile nav on link click */
  links.forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Active link based on scroll position */
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }
}

/* ============================================================
   PARTICLES — canvas background animation
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  /* Resize handler */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Particle factory */
  function makeParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.8 + 0.4,
      dx:   (Math.random() - 0.5) * 0.4,
      dy:   (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() < 0.6 ? '0,232,200' : Math.random() < 0.5 ? '232,75,106' : '255,192,68',
    };
  }

  /* Initialise particles */
  const COUNT = Math.min(120, Math.floor((W * H) / 8000));
  for (let i = 0; i < COUNT; i++) particles.push(makeParticle());

  /* Draw connections between nearby particles */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,232,200,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* Animation loop */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    drawConnections();

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;

      /* Wrap edges */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  /* Add .reveal class to animatable elements */
  const targets = [
    '.bio-card', '.trait', '.flip-card', '.power-card',
    '.office-card', '.dept-card', '.cta-card',
    '.sec-label', '.sec-title', '.sec-sub', '.quote-carousel'
  ];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============================================================
   BIO TYPING ANIMATION
   ============================================================ */
function initBioTyping() {
  const el = document.querySelector('.bio-typing');
  if (!el) return;

  const phrases = [
    '> passionate about making CS accessible to all.',
    '> believes every bug is a learning opportunity.',
    '> favourite data structure: a well-organised coffee queue.',
    '> currently reading: "Designing Data-Intensive Apps".',
    '> side quest: making recursion feel obvious.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  function type() {
    if (paused) return;

    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        paused = true;
        setTimeout(() => { paused = false; deleting = true; }, 2200);
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(type, deleting ? 38 : 62);
  }

  /* Delay start until section is visible */
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(type, 800);
      observer.disconnect();
    }
  }, { threshold: 0.4 });

  const aboutSec = document.getElementById('about');
  if (aboutSec) observer.observe(aboutSec);
}

/* ============================================================
   QUOTE CAROUSEL — auto rotate with fade
   ============================================================ */
function initQuoteCarousel() {
  const quotes  = document.querySelectorAll('.quote');
  const dotsWrap = document.querySelector('.qdots');
  const prevBtn  = document.getElementById('qprev');
  const nextBtn  = document.getElementById('qnext');

  if (!quotes.length) return;

  let current = 0;
  let timer;

  /* Build dots */
  quotes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'qdot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to quote ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    /* Exit current */
    quotes[current].classList.remove('active');
    quotes[current].classList.add('exit');
    setTimeout(() => quotes[current].classList.remove('exit'), 600);

    current = (index + quotes.length) % quotes.length;

    /* Enter new */
    quotes[current].classList.add('active');

    /* Update dots */
    document.querySelectorAll('.qdot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4800);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Keyboard nav */
  document.querySelector('.quote-carousel').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* Pause on hover */
  document.querySelector('.quote-carousel').addEventListener('mouseenter', () => clearInterval(timer));
  document.querySelector('.quote-carousel').addEventListener('mouseleave', resetTimer);

  resetTimer();
}

/* ============================================================
   SUPERPOWER CARDS — click/touch to reveal
   ============================================================ */
function initPowerCards() {
  const cards = document.querySelectorAll('.power-card');

  cards.forEach(card => {
    function toggle() {
      const isRevealed = card.classList.toggle('revealed');
      card.setAttribute('aria-expanded', String(isRevealed));
    }

    card.addEventListener('click', toggle);

    /* Keyboard: Enter/Space */
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/* ============================================================
   FLIP CARDS — touch support for mobile
   ============================================================ */
function initFlipCards() {
  const cards = document.querySelectorAll('.flip-card');

  cards.forEach(card => {
    /* Touch: toggle .flipped class */
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    /* Keyboard: Enter/Space */
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function initFooterYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
}
