/* ===== GlowLeaf – Main JavaScript ===== */

(function () {
  'use strict';

  // ===== DOM REFERENCES =====
  const cursorGlow = document.getElementById('cursor-glow');
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const particlesCanvas = document.getElementById('particles-canvas');
  const ctx = particlesCanvas.getContext('2d');
  const antigravityBtn = document.getElementById('antigravity-btn');
  const contactForm = document.getElementById('contact-form');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isAntigravity = false;

  // ===== RESIZE CANVAS =====
  function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ===== CUSTOM CURSOR =====
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.left = mouseX + 'px';
    cursorGlow.style.top = mouseY + 'px';
  });

  document.addEventListener('mousedown', () => cursorGlow.classList.add('active'));
  document.addEventListener('mouseup', () => cursorGlow.classList.remove('active'));

  // Enlarge cursor on interactive elements
  const interactives = document.querySelectorAll('a, button, input, textarea, .product-card, .gallery-item');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursorGlow.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
  });

  // ===== NAVBAR SCROLL =====
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    navbar.classList.toggle('scrolled', current > 60);
    lastScroll = current;
  });

  // ===== MOBILE NAV TOGGLE =====
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // ===== BUTTON RIPPLE EFFECT =====
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = this.querySelector('.btn-ripple');
      if (!ripple) return;
      const rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      ripple.classList.remove('animate');
      void ripple.offsetWidth; // force reflow
      ripple.classList.add('animate');
    });
  });

  // ===== SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger the reveal
        const delay = Array.from(entry.target.parentElement.children)
          .filter(c => c.hasAttribute('data-reveal'))
          .indexOf(entry.target) * 100;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== PARALLAX ON MOUSE MOVE =====
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  const floatElements = document.querySelectorAll('[data-float]');

  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translate(${cx * speed * 30}px, ${cy * speed * 30}px)`;
    });

    floatElements.forEach(el => {
      const speed = Math.random() * 0.5 + 0.3;
      el.style.transform = `translate(${cx * speed * 15}px, ${cy * speed * 15}px)`;
    });
  });

  // ===== TILT EFFECT ON PRODUCT CARDS =====
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const isOffset = this.classList.contains('product-card--offset');
      const baseY = isOffset ? 30 : 0;
      this.style.transform = `translateY(${baseY - 8}px) scale(1.02) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    card.addEventListener('mouseleave', function () {
      const isOffset = this.classList.contains('product-card--offset');
      this.style.transform = isOffset ? 'translateY(30px)' : '';
    });
  });

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = Math.round(current);
        }, 20);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ===== FLOATING PARTICLES =====
  const particles = [];
  const PARTICLE_COUNT = 50;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * particlesCanvas.width;
      this.y = Math.random() * particlesCanvas.height;
      this.size = Math.random() * 3 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.2;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
      // Some particles are leaf-shaped (drawn as elongated ellipses)
      this.isLeaf = Math.random() > 0.7;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;
      this.life--;

      // Drift towards cursor slightly
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        this.speedX += dx * 0.00005;
        this.speedY += dy * 0.00005;
      }

      if (this.life <= 0 || this.x < -20 || this.x > particlesCanvas.width + 20 ||
          this.y < -20 || this.y > particlesCanvas.height + 20) {
        this.reset();
      }
    }
    draw() {
      const alpha = this.opacity * (this.life / this.maxLife);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = alpha;

      if (this.isLeaf) {
        ctx.fillStyle = '#39ff14';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size * 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#39ff14';
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = this.size * 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ===== ANTI-GRAVITY MODE =====
  const antigravityItems = document.querySelectorAll('[data-antigravity]');
  let antigravityAnimId = null;

  antigravityBtn.addEventListener('click', () => {
    isAntigravity = !isAntigravity;
    antigravityBtn.classList.toggle('active', isAntigravity);
    document.body.classList.toggle('antigravity-active', isAntigravity);

    if (isAntigravity) {
      // Give each element a random velocity
      antigravityItems.forEach(el => {
        el._agVx = (Math.random() - 0.5) * 4;
        el._agVy = (Math.random() - 0.5) * 4 - 2; // slight upward bias
        el._agX = 0;
        el._agY = 0;
        el._agRot = 0;
        el._agRotV = (Math.random() - 0.5) * 3;
      });
      animateAntigravity();
    } else {
      cancelAnimationFrame(antigravityAnimId);
      // Reset all positions
      antigravityItems.forEach(el => {
        el.style.transform = '';
        el._agX = 0; el._agY = 0;
      });
    }
  });

  function animateAntigravity() {
    if (!isAntigravity) return;
    antigravityItems.forEach(el => {
      // Apply gravity inversion (upward drift)
      el._agVy -= 0.02;
      // Mouse repulsion
      const rect = el.getBoundingClientRect();
      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;
      const dx = elCx - mouseX;
      const dy = elCy - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        const force = (250 - dist) / 250 * 0.5;
        el._agVx += (dx / dist) * force;
        el._agVy += (dy / dist) * force;
      }

      // Damping
      el._agVx *= 0.98;
      el._agVy *= 0.98;
      el._agRotV *= 0.99;

      el._agX += el._agVx;
      el._agY += el._agVy;
      el._agRot += el._agRotV;

      // Bounds – softly bounce
      const maxDrift = 200;
      if (Math.abs(el._agX) > maxDrift) el._agVx *= -0.5;
      if (Math.abs(el._agY) > maxDrift) el._agVy *= -0.5;

      el.style.transform = `translate(${el._agX}px, ${el._agY}px) rotate(${el._agRot}deg)`;
    });
    antigravityAnimId = requestAnimationFrame(animateAntigravity);
  }

  // ===== SCATTER ON CLICK (anti-gravity inspired) =====
  document.addEventListener('click', (e) => {
    if (!isAntigravity) return;
    antigravityItems.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;
      const dx = elCx - e.clientX;
      const dy = elCy - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 500 && dist > 0) {
        const force = (500 - dist) / 500 * 8;
        el._agVx += (dx / dist) * force;
        el._agVy += (dy / dist) * force;
        el._agRotV += (Math.random() - 0.5) * 5;
      }
    });
  });

  // ===== CONTACT FORM =====
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit .btn-text');
    const origText = btn.textContent;
    btn.textContent = 'Sent! 🍃';
    contactForm.reset();
    setTimeout(() => { btn.textContent = origText; }, 2500);
  });

  // ===== SMOOTH SCROLL FOR NAV LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

})();
