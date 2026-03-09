// ===== PARTICLE BACKGROUND =====
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles, mouse;
  const PARTICLE_COUNT_DESKTOP = 70;
  const PARTICLE_COUNT_MOBILE = 30;
  const CONNECTION_DIST = 140;

  mouse = { x: null, y: null };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = w < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.5 ? '0, 229, 255' : '156, 92, 255'
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, 0.5)`;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Mouse interaction (desktop only)
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }
      }

      // Dampen velocity
      p.vx *= 0.999;
      p.vy *= 0.999;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  createParticles();
  draw();
})();


// ===== NAV SCROLL BEHAVIOR =====
(function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
})();


// ===== SCROLL REVEAL =====
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


// ===== CARD TILT EFFECT (Desktop only) =====
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


// ===== HERO TEXT ANIMATION =====
(function initTextReveal() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  const lines = title.querySelectorAll('.line');
  lines.forEach((line, lineIndex) => {
    const text = line.textContent;
    const isGradient = line.classList.contains('gradient-text');
    line.textContent = '';
    line.style.opacity = '1';

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(20px);
        animation: fade-in-up 0.5s ${(lineIndex * 0.2) + (i * 0.03)}s ease forwards;
      `;
      if (isGradient) {
        span.style.background = 'linear-gradient(135deg, #00e5ff, #9c5cff)';
        span.style.webkitBackgroundClip = 'text';
        span.style.backgroundClip = 'text';
        span.style.webkitTextFillColor = 'transparent';
      }
      line.appendChild(span);
    });
  });
})();


// ===== FORM HANDLING (Web3Forms) =====
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = document.getElementById('form-submit-btn');
  const originalText = btn.textContent;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = form.querySelector('#form-name').value.trim();
    const email = form.querySelector('#form-email').value.trim();
    const message = form.querySelector('#form-message').value.trim();

    if (!name || !email || !message) return;

    // Loading state
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';
    btn.style.opacity = '0.7';

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        btn.textContent = 'Message envoyé ✓';
        btn.style.background = 'linear-gradient(135deg, #48c78e, #36b37e)';
        btn.style.opacity = '1';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      } else {
        console.error('Web3Forms error:', result);
        throw new Error(result.message || 'Erreur');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      btn.textContent = 'Erreur — réessayez';
      btn.style.background = 'linear-gradient(135deg, #ff5f57, #e74c3c)';
      btn.style.opacity = '1';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });
})();


// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ===== WHATSAPP CHAT WIDGET =====
(function initWhatsApp() {
  const PHONE = '21658885966';
  const DEFAULT_MSG = 'Bonjour, je souhaite discuter d\'un projet.';

  const bubble = document.getElementById('wa-bubble');
  const panel = document.getElementById('wa-panel');
  const closeBtn = document.getElementById('wa-close');
  const input = document.getElementById('wa-input');
  const sendBtn = document.getElementById('wa-send');

  if (!bubble) return;

  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function openWhatsApp(message) {
    const text = encodeURIComponent(message || DEFAULT_MSG);
    const url = isMobile
      ? `https://wa.me/${PHONE}?text=${text}`
      : `https://web.whatsapp.com/send?phone=${PHONE}&text=${text}`;

    if (isMobile) {
      window.open(url, '_blank');
    } else {
      // Open WhatsApp Web in a sized popup
      const w = 900, h = 600;
      const left = (screen.width - w) / 2;
      const top = (screen.height - h) / 2;
      window.open(url, 'whatsapp', `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`);
    }
  }

  function togglePanel() {
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    bubble.classList.toggle('active');
    if (!isOpen && input) {
      setTimeout(() => input.focus(), 400);
    }
  }

  function closePanel() {
    panel.classList.remove('open');
    bubble.classList.remove('active');
  }

  function sendMessage() {
    const msg = input ? input.value.trim() : '';
    openWhatsApp(msg || DEFAULT_MSG);
    if (input) input.value = '';
    closePanel();
  }

  // Bubble click
  bubble.addEventListener('click', () => {
    if (isMobile) {
      openWhatsApp(DEFAULT_MSG);
    } else {
      togglePanel();
    }
  });

  // Panel close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  // Send button
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  // Enter key in input
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
})();
