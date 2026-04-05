/* ============================================================
   MEIRESHAUS — instagram.js
   Feed do Instagram @meires_haus

   ══════════════════════════════════════════════════════════
   ESCOLHA UMA DAS 3 OPÇÕES ABAIXO e siga as instruções:
   ══════════════════════════════════════════════════════════

   OPÇÃO 1 — BEHOLD.SO (mais fácil, recomendada) ✅
   ─────────────────────────────────────────────
   1. Acesse https://behold.so e crie uma conta gratuita
   2. Clique em "Connect Instagram" e autorize o @meires_haus
   3. Crie um novo Feed, escolha o layout "Grid"
   4. Vá em Settings do feed → copie o "Feed ID" (ex: AbCdEfGh1234)
   5. Cole o Feed ID em BEHOLD_FEED_ID abaixo
   6. Defina MODO = 'behold'

   OPÇÃO 2 — INSTAGRAM GRAPH API (oficial, mais técnica) ⚙️
   ──────────────────────────────────────────────────────
   PRÉ-REQUISITO: conta @meires_haus deve ser Business ou Creator
   e estar conectada a uma Página do Facebook.

   1. Acesse https://developers.facebook.com → "Meus Apps" → "Criar App"
   2. Escolha tipo "Business" → adicione produto "Instagram Graph API"
   3. Em "Instagram Graph API" → gere um Token de Acesso de Usuário
   4. Converta para token de longa duração (60 dias):
      GET https://graph.instagram.com/access_token
        ?grant_type=ig_exchange_token
        &client_id={APP_ID}
        &client_secret={APP_SECRET}
        &access_token={SHORT_TOKEN}
   5. Descubra seu USER_ID:
      GET https://graph.instagram.com/me?fields=id,username&access_token={TOKEN}
   6. Preencha ACCESS_TOKEN e USER_ID abaixo
   7. Defina MODO = 'api'

   OPÇÃO 3 — MOCK (demonstração, sem Instagram real) 🎨
   ────────────────────────────────────────────────────
   Mantém os placeholders coloridos animados.
   Defina MODO = 'mock'
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ——— CONFIGURAÇÃO — edite aqui ——— */
const INSTAGRAM_CONFIG = {

  /* Escolha o modo: 'behold' | 'api' | 'mock' */
  MODO: 'mock',

  /* ── OPÇÃO 1: Behold.so ──────────────────────── */
  BEHOLD_FEED_ID: 'SEU_FEED_ID_AQUI',      // ex: 'AbCdEfGh1234'

  /* ── OPÇÃO 2: Graph API ──────────────────────── */
  ACCESS_TOKEN: 'SEU_ACCESS_TOKEN_AQUI',
  USER_ID:      'SEU_USER_ID_AQUI',

  /* Número de fotos a exibir (Opção 2 e Mock) */
  LIMIT: 12,

  /* Intervalo de atualização em ms (0 = desativado)
     Ex: 3600000 = atualiza a cada 1 hora */
  AUTO_REFRESH_INTERVAL: 3_600_000,
};

/* ——— DADOS MOCK ——— */
const MOCK_POSTS = [
  { id:'1',  caption:'Tarde de jogos na área de convivência! 🎲❤️',          color:'#EBF5FB', icon:'fa-dice'          },
  { id:'2',  caption:'Jardinagem terapêutica: cuidar das plantas faz bem! 🌱', color:'#EAFAF1', icon:'fa-seedling'      },
  { id:'3',  caption:'Café da manhã especial de domingo. ☕🍓',               color:'#FEF9E7', icon:'fa-mug-hot'       },
  { id:'4',  caption:'Fisioterapia em grupo — movimentar o corpo é saúde! 💪', color:'#FDEDEC', icon:'fa-person-walking'},
  { id:'5',  caption:'Aniversário da Dona Rosa com muito bolo e amor! 🎂🎉',  color:'#F9EBEA', icon:'fa-cake-candles'  },
  { id:'6',  caption:'Tarde de músicas e violão com nossos residentes. 🎵',   color:'#EBF5FB', icon:'fa-guitar'        },
  { id:'7',  caption:'Atividade de pintura: arte que estimula o bem-estar! 🎨',color:'#F4ECF7', icon:'fa-paintbrush'   },
  { id:'8',  caption:'Caminhada matinal no jardim com sol e ânimo! 🌞🌿',     color:'#EAFAF1', icon:'fa-sun'           },
  { id:'9',  caption:'Visita da família transforma o dia em festa! ❤️👨‍👩‍👧',    color:'#FEF9E7', icon:'fa-house-heart'  },
  { id:'10', caption:'Momento de relaxamento e leitura à tarde. 📚☕',        color:'#EBF5FB', icon:'fa-book-open'     },
  { id:'11', caption:'Nossa equipe: dedicação e carinho todos os dias! 👩‍⚕️',  color:'#EBF5FB', icon:'fa-user-nurse'    },
  { id:'12', caption:'Domingo na varanda: pôr do sol e muito agradecimento! 🌅',color:'#FDEDEC',icon:'fa-sun'          },
];

/* ——— ESTADO ——— */
let galleryItems = [];

/* ——— ELEMENTOS DOM ——— */
function getEl() {
  return {
    container: document.getElementById('instagramGallery'),
    loading:   document.getElementById('galleryLoading'),
    error:     document.getElementById('galleryError'),
  };
}

/* ══════════════════════════════════════════════
   MODO 1 — BEHOLD.SO
   Usa o widget oficial da Behold que monta o grid
   automaticamente e mantém as fotos atualizadas.
══════════════════════════════════════════════ */
function loadBehold() {
  const { container, loading, error } = getEl();
  const feedId = INSTAGRAM_CONFIG.BEHOLD_FEED_ID;

  if (!feedId || feedId === 'SEU_FEED_ID_AQUI') {
    console.warn('[Instagram] Configure BEHOLD_FEED_ID em instagram.js');
    if (loading) loading.style.display = 'none';
    if (error)   error.style.display   = 'flex';
    return;
  }

  if (loading) loading.style.display = 'none';
  if (!container) return;

  /* Injeta o widget da Behold — ele monta e estiliza o grid */
  container.innerHTML = `<div id="behold-widget-${feedId}"></div>`;

  /* Injeta o script da Behold se ainda não foi carregado */
  if (!document.getElementById('behold-script')) {
    const script = document.createElement('script');
    script.id    = 'behold-script';
    script.src   = 'https://w.behold.so/widget.js';
    script.type  = 'module';
    document.head.appendChild(script);
  }

  /* Adiciona CSS básico de responsividade sobre o widget */
  if (!document.getElementById('behold-overrides')) {
    const style = document.createElement('style');
    style.id = 'behold-overrides';
    style.textContent = `
      #behold-widget-${feedId} { width: 100%; }
      #behold-widget-${feedId} .BeholdWidget { border-radius: 14px; overflow: hidden; }
    `;
    document.head.appendChild(style);
  }
}

/* ══════════════════════════════════════════════
   MODO 2 — INSTAGRAM GRAPH API
   Busca diretamente as últimas fotos via API oficial.
══════════════════════════════════════════════ */
async function fetchGraphAPI() {
  const { ACCESS_TOKEN, USER_ID, LIMIT } = INSTAGRAM_CONFIG;

  if (ACCESS_TOKEN === 'SEU_ACCESS_TOKEN_AQUI' || USER_ID === 'SEU_USER_ID_AQUI') {
    throw new Error('Configure ACCESS_TOKEN e USER_ID em instagram.js');
  }

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url    = `https://graph.instagram.com/${USER_ID}/media`
               + `?fields=${fields}&limit=${LIMIT}&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.data || [];
}

/* ══════════════════════════════════════════════
   RENDERIZAÇÃO DO GRID (Modos API e Mock)
══════════════════════════════════════════════ */
function renderGrid(posts) {
  const { container, loading, error } = getEl();
  if (!container) return;

  if (loading) loading.style.display = 'none';
  container.innerHTML = '';
  galleryItems = [];

  const imagePosts = posts.filter(p =>
    !p.media_type || p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM'
  );

  if (!imagePosts.length) {
    if (error) error.style.display = 'flex';
    return;
  }

  imagePosts.forEach((post, idx) => {
    const src     = post.media_url || post.thumbnail_url || null;
    const caption = (post.caption || '').replace(/#\S+/g, '').trim();
    const short   = caption.length > 100 ? caption.slice(0, 97) + '…' : caption;
    const link    = post.permalink || 'https://instagram.com/meires_haus';

    galleryItems.push({ src: src || '', alt: caption || 'Foto da Meireshaus', caption, permalink: link });

    const item = document.createElement('div');
    item.className = 'gallery__item fade-in';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', short || `Foto ${idx + 1} da Meireshaus`);

    if (src) {
      item.innerHTML = `
        <img src="${esc(src)}"
             alt="${esc(short || 'Foto da Meireshaus')}"
             loading="lazy" decoding="async"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="gallery__item-placeholder" style="display:none;background:${post.color||'#EBF5FB'}">
          <i class="fas ${post.icon||'fa-image'}" style="color:#2980B9;font-size:2rem" aria-hidden="true"></i>
        </div>
        <div class="gallery__item-overlay" aria-hidden="true">
          <i class="fab fa-instagram"></i>
          ${short ? `<span class="gallery__item-caption">${esc(short)}</span>` : ''}
        </div>`;
    } else {
      item.innerHTML = `
        <div class="gallery__item-placeholder" style="display:flex;background:${post.color||'#EBF5FB'}">
          <i class="fas ${post.icon||'fa-image'}" style="color:#2980B9;font-size:2rem" aria-hidden="true"></i>
        </div>
        <div class="gallery__item-overlay" aria-hidden="true">
          <i class="fab fa-instagram"></i>
          ${short ? `<span class="gallery__item-caption">${esc(short)}</span>` : ''}
        </div>`;
    }

    item.addEventListener('click', () => openLightbox(idx));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
    });

    container.appendChild(item);
  });

  /* Anima itens ao entrar na viewport */
  if (window.IntersectionObserver) {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    container.querySelectorAll('.gallery__item').forEach(el => obs.observe(el));
  } else {
    container.querySelectorAll('.gallery__item').forEach(el => el.classList.add('visible'));
  }
}

/* ——— ABRE LIGHTBOX ——— */
function openLightbox(idx) {
  if (typeof window.Lightbox?.open === 'function') {
    window.Lightbox.open(galleryItems, idx);
  } else {
    const item = galleryItems[idx];
    if (item?.permalink) window.open(item.permalink, '_blank', 'noopener');
  }
}

/* ——— CARREGA GALERIA (ponto de entrada) ——— */
async function loadGallery() {
  const { container, loading, error } = getEl();
  if (loading) { loading.style.display = 'flex'; }
  if (error)   { error.style.display   = 'none';  }
  if (container) { container.innerHTML = '';       }

  switch (INSTAGRAM_CONFIG.MODO) {

    case 'behold':
      loadBehold();
      break;

    case 'api':
      try {
        const posts = await fetchGraphAPI();
        renderGrid(posts);
      } catch (err) {
        console.warn('[Instagram Graph API]', err.message);
        console.info('[Instagram] Usando mock como fallback.');
        renderGrid(MOCK_POSTS.slice(0, INSTAGRAM_CONFIG.LIMIT));
      }
      break;

    case 'mock':
    default:
      await new Promise(r => setTimeout(r, 600));
      renderGrid(MOCK_POSTS.slice(0, INSTAGRAM_CONFIG.LIMIT));
      break;
  }
}

/* ——— ATUALIZAÇÃO AUTOMÁTICA ——— */
function setupAutoRefresh() {
  const ms = INSTAGRAM_CONFIG.AUTO_REFRESH_INTERVAL;
  if (ms && ms > 0 && INSTAGRAM_CONFIG.MODO !== 'behold') {
    setInterval(loadGallery, ms);
  }
}

/* ——— UTILITÁRIO: escapa HTML ——— */
function esc(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

/* ——— INICIALIZAÇÃO ——— */
document.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  setupAutoRefresh();
});
