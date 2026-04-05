/* ============================================================
   MEIRESHAUS — script.js
   Comportamentos gerais: header, menu, scroll, formulário,
   lightbox, animações via IntersectionObserver
   ============================================================ */

'use strict';

/* ——— UTILIDADES ——— */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. HEADER — scroll + hambúrguer
============================================================ */
(function initHeader() {
  const header    = $('#header');
  const hamburger = $('#hamburger');
  const nav       = $('#mainNav');

  if (!header || !hamburger || !nav) return;

  /* Classe "scrolled" quando rola mais de 20px */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // inicial

  /* Verifica se o hambúrguer está visível (= estamos em mobile) */
  function isMobile() {
    return window.getComputedStyle(hamburger).display !== 'none';
  }

  /* Menu hambúrguer toggle — só opera em mobile */
  function toggleMenu(forceClose = false) {
    if (!isMobile()) {
      /* No desktop, garante que o menu não fique travado */
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('nav-open');
      return;
    }
    const isOpen = hamburger.classList.contains('open') && !forceClose;
    hamburger.classList.toggle('open',    !isOpen);
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('nav-open', !isOpen);
  }

  hamburger.addEventListener('click', () => toggleMenu());

  /* Fecha o menu ao clicar em um link (só tem efeito em mobile) */
  $$('.nav__link', nav).forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  /* Fecha ao clicar fora (só tem efeito em mobile) */
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) toggleMenu(true);
  });

  /* Fecha com Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(true);
  });
})();

/* ============================================================
   2. SMOOTH SCROLL — âncoras internas
============================================================ */
(function initSmoothScroll() {
  const headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72',
    10
  );

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ============================================================
   3. LINK ATIVO NA NAVEGAÇÃO — destaca seção visível
============================================================ */
function updateActiveLink() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const headerH = 80;
  let current = '';

  sections.forEach(sec => {
    if (window.scrollY + headerH + 10 >= sec.offsetTop) {
      current = sec.id;
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

/* ============================================================
   4. ANIMAÇÕES DE SCROLL — IntersectionObserver
============================================================ */
(function initScrollAnimations() {
  const elements = $$('.fade-in, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima só uma vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. FORMULÁRIO DE CONTATO — validação + envio mock
============================================================ */
(function initContactForm() {
  const form       = $('#contactForm');
  if (!form) return;

  const submitBtn  = $('#submitBtn');
  const successMsg = $('#formSuccess');

  /* Helpers de validação */
  function showError(fieldId, msg) {
    const el = $(`#${fieldId}Error`);
    if (el) el.textContent = msg;
    const input = form.querySelector(`[id="contact${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}"]`);
    if (input) input.setAttribute('aria-invalid', 'true');
  }
  function clearError(fieldId) {
    const el = $(`#${fieldId}Error`);
    if (el) el.textContent = '';
    const input = form.querySelector(`[id="contact${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}"]`);
    if (input) input.removeAttribute('aria-invalid');
  }
  function clearAllErrors() {
    ['name','phone','email','message'].forEach(clearError);
  }

  /* Validação em tempo real */
  $$('input, textarea', form).forEach(field => {
    field.addEventListener('input', () => {
      const key = field.id.replace('contact','').toLowerCase();
      clearError(key);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    const name    = $('#contactName').value.trim();
    const phone   = $('#contactPhone').value.trim();
    const email   = $('#contactEmail').value.trim();
    const message = $('#contactMessage').value.trim();

    let valid = true;

    if (name.length < 2) {
      showError('name', 'Por favor, informe seu nome completo.');
      valid = false;
    }
    if (!phone.replace(/\D/g, '').match(/^\d{10,11}$/)) {
      showError('phone', 'Informe um telefone válido com DDD.');
      valid = false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Informe um e-mail válido.');
      valid = false;
    }
    if (message.length < 10) {
      showError('message', 'Mensagem muito curta. Descreva como podemos ajudar.');
      valid = false;
    }

    if (!valid) return;

    /* Estado de carregamento */
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      /*
       * INTEGRAÇÃO REAL:
       * Substitua o bloco abaixo pela chamada real à sua API de e-mail.
       *
       * Opções populares:
       *   - FormSubmit (https://formsubmit.co) — basta mudar o action do form
       *   - EmailJS (https://emailjs.com)
       *   - API própria / Serverless (Netlify Functions, Vercel, etc.)
       *
       * Exemplo com FormSubmit — sem necessidade de backend:
       *   <form action="https://formsubmit.co/SEU_EMAIL@gmail.com" method="POST">
       *
       * Exemplo com EmailJS:
       *   await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', { name, phone, email, message });
       */

      /* ——— Mock: simula envio com 1.5s de delay ——— */
      await new Promise(resolve => setTimeout(resolve, 1500));

      /* Sucesso */
      form.reset();
      if (successMsg) {
        successMsg.style.display = 'flex';
        setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
      }
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      showError('message', 'Ocorreu um erro. Tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
    }
  });

  /* Máscara de telefone simples */
  const phoneInput = $('#contactPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})/, '($1');
      }
      phoneInput.value = v;
    });
  }
})();

/* ============================================================
   6. LIGHTBOX — abrir / fechar / navegar
   (Usado pelo instagram.js ao clicar nas fotos)
============================================================ */
const Lightbox = (function() {
  const lb       = $('#lightbox');
  const img      = $('#lightboxImg');
  const caption  = $('#lightboxCaption');
  const overlay  = $('#lightboxOverlay');
  const closeBtn = $('#lightboxClose');
  const prevBtn  = $('#lightboxPrev');
  const nextBtn  = $('#lightboxNext');

  let items   = [];   // array de { src, alt, caption }
  let current = 0;

  function show(idx) {
    if (!lb || !items.length) return;
    current = (idx + items.length) % items.length;
    const item = items[current];
    img.src = item.src;
    img.alt = item.alt || '';
    caption.textContent = item.caption || '';
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    img.focus();
  }

  function hide() {
    if (!lb) return;
    lb.style.display = 'none';
    document.body.style.overflow = '';
    img.src = '';
  }

  if (overlay)  overlay.addEventListener('click', hide);
  if (closeBtn) closeBtn.addEventListener('click', hide);
  if (prevBtn)  prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn)  nextBtn.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', (e) => {
    if (!lb || lb.style.display === 'none') return;
    if (e.key === 'Escape')     hide();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  return {
    open(newItems, startIndex = 0) {
      items = newItems;
      show(startIndex);
    },
    close: hide,
  };
})();

/* Expõe o Lightbox globalmente para o instagram.js */
window.Lightbox = Lightbox;

/* ============================================================
   7. LAZY LOADING — fallback para browsers antigos
============================================================ */
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // nativo

  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => {
    if (img.dataset.src) observer.observe(img);
  });
})();
