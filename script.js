/* ═══════════════════════════════════════════════════════
   Joote — Banner Showcase Script
   Dynamic backgrounds, dial animations, particle effects
   ═══════════════════════════════════════════════════════ */

// ── PRODUCT DATA ─────────────────────────────────────────
// Array 'products' is loaded from data.js

// ── STATE ────────────────────────────────────────────────
let currentIndex = 0;
let isTransitioning = false;
let autoPlayTimer = null;
const AUTO_PLAY_DELAY = 5000;

// ── DOM REFERENCES ───────────────────────────────────────
const bgLayer = document.getElementById('bgLayer');
const bgLayerNext = document.getElementById('bgLayerNext');
const nameBgInner = document.getElementById('nameBgInner');
const shoeImg = document.getElementById('shoeImg');
const shoeContainer = document.getElementById('shoeContainer');
const productInfo = document.getElementById('productInfo');
const infoCraft = document.getElementById('infoCraft');
const infoName = document.getElementById('infoName');
const infoOrigin = document.getElementById('infoOrigin');
const infoPrice = document.getElementById('infoPrice');
const infoDesc = document.getElementById('infoDesc');
const infoCta = document.getElementById('infoCta');
const statusBadge = document.getElementById('statusBadge');
const thumbRail = document.getElementById('thumbRail');
const progressFill = document.getElementById('progressFill');
const particleCanvas = document.getElementById('particleCanvas');

// ── INIT ─────────────────────────────────────────────────
function init() {
  buildThumbnails();
  applyProduct(0, true);
  initParticles();
  startAutoPlay();
  bindEvents();
}

// ── BUILD THUMBNAILS ─────────────────────────────────────
function buildThumbnails() {
  if (!thumbRail) return;
  products.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'thumb-rail__item' + (i === 0 ? ' active' : '');
    item.style.background = p.color;
    item.innerHTML = `<img src="${p.image}" alt="${p.name}" loading="lazy">`;
    item.addEventListener('click', () => goTo(i));
    thumbRail.appendChild(item);
  });
}

// ── APPLY PRODUCT (update DOM) ───────────────────────────
function applyProduct(index, instant = false) {
  const p = products[index];
  
  // Background gradient
  const gradient = `radial-gradient(ellipse at 50% 40%, ${p.bgGradient[1]}cc 0%, ${p.bgGradient[0]} 50%, ${p.bgGradient[2]} 100%)`;
  
  if (instant) {
    bgLayer.style.background = gradient;
    bgLayer.style.opacity = '1';
  } else {
    bgLayerNext.style.background = gradient;
    bgLayerNext.style.opacity = '1';
    bgLayer.style.opacity = '0';
    setTimeout(() => {
      bgLayer.style.background = gradient;
      bgLayer.style.opacity = '1';
      bgLayerNext.style.opacity = '0';
    }, 800);
  }
  
  // CSS variable for shoe color
  document.documentElement.style.setProperty('--shoe-color', p.color);
  
  // Background name
  nameBgInner.textContent = p.shortName;
  
  // Shoe image
  shoeImg.src = p.image;
  shoeImg.alt = p.name;
  
  // Product info
  infoCraft.textContent = `✦ ${p.craft.toUpperCase()} CRAFT ✦`;
  infoName.textContent = p.name;
  infoOrigin.textContent = p.origin;
  
  if (p.status === 'sale' && p.price) {
    infoPrice.innerHTML = `
      <span class="banner__info-price-current">₹${p.price.toLocaleString('en-IN')}</span>
      <span class="banner__info-price-original">₹${p.originalPrice.toLocaleString('en-IN')}</span>
    `;
  } else {
    infoPrice.innerHTML = `
      <span class="banner__info-price-current" style="color: var(--brand-gold)">COMING SOON</span>
    `;
  }
  
  infoDesc.textContent = p.description;
  
  if (p.status === 'coming') {
    infoCta.textContent = 'NOTIFY ME';
    infoCta.href = p.link;
    statusBadge.textContent = 'COMING SOON';
    statusBadge.classList.add('coming-soon');
  } else {
    infoCta.innerHTML = `SHOP NOW <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    infoCta.href = p.link;
    statusBadge.textContent = 'IN STOCK';
    statusBadge.classList.remove('coming-soon');
  }
  
  // Progress bar
  progressFill.style.width = `${((index + 1) / products.length) * 100}%`;
  
  // Active thumbnail
  if (thumbRail) {
    document.querySelectorAll('.thumb-rail__item').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
  }

  // Set dynamic scale for the shoe based on data (default 1)
  shoeImg.style.setProperty('--shoe-scale', p.heroScale || 1);

  // Update particle color target
  if (window._particleColorTarget) {
    window._particleColorTarget = hexToRgb(p.color);
  }
}

// ── TRANSITION TO A NEW SHOE ─────────────────────────────
function goTo(index) {
  if (index === currentIndex || isTransitioning) return;
  isTransitioning = true;
  resetAutoPlay();
  
  // Phase 1: Animate out
  nameBgInner.classList.remove('animating-in', 'floating');
  shoeImg.classList.remove('animating-in', 'floating');
  productInfo.classList.remove('animating-in');
  
  nameBgInner.classList.add('animating-out');
  shoeImg.classList.add('animating-out');
  productInfo.classList.add('animating-out');
  
  // Phase 2: After exit, update content and animate in
  setTimeout(() => {
    currentIndex = index;
    applyProduct(index);
    
    nameBgInner.classList.remove('animating-out');
    shoeImg.classList.remove('animating-out');
    productInfo.classList.remove('animating-out');
    
    nameBgInner.classList.add('animating-in');
    shoeImg.classList.add('animating-in');
    productInfo.classList.add('animating-in');
    
    // Phase 3: After enter, enable floating
    setTimeout(() => {
      nameBgInner.classList.remove('animating-in');
      shoeImg.classList.remove('animating-in');
      productInfo.classList.remove('animating-in');
      shoeImg.classList.add('floating');
      isTransitioning = false;
      startAutoPlay();
    }, 950);
    
  }, 500);
}

function goNext() {
  goTo((currentIndex + 1) % products.length);
}

function goPrev() {
  goTo((currentIndex - 1 + products.length) % products.length);
}

// ── AUTO PLAY ────────────────────────────────────────────
function startAutoPlay() {
  clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(goNext, AUTO_PLAY_DELAY);
}

function resetAutoPlay() {
  clearInterval(autoPlayTimer);
}

// ── EVENT BINDING ────────────────────────────────────────
function bindEvents() {
  // Scroll event to shrink the hero banner
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });

  // Parallax effect on mouse move (background name + shoe)
  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    
    if (!isTransitioning) {
      nameBgInner.style.transform = `translate(${cx * 30}px, ${cy * 15}px)`;
      shoeContainer.style.transform = `translate(${cx * -15}px, ${cy * -10}px)`;
    }
  });
}

// ── PARTICLE SYSTEM ──────────────────────────────────────
function initParticles() {
  const ctx = particleCanvas.getContext('2d');
  let width = particleCanvas.width = window.innerWidth;
  let height = particleCanvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = particleCanvas.width = window.innerWidth;
    height = particleCanvas.height = window.innerHeight;
  });
  
  const PARTICLE_COUNT = 60;
  const particles = [];
  
  const startColor = hexToRgb(products[0].color);
  window._particleColorTarget = { ...startColor };
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.3 + 0.05,
      color: { ...startColor }
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    const target = window._particleColorTarget;
    
    particles.forEach(p => {
      // Drift
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
      
      // Lerp color toward target
      p.color.r += (target.r - p.color.r) * 0.02;
      p.color.g += (target.g - p.color.g) * 0.02;
      p.color.b += (target.b - p.color.b) * 0.02;
      
      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.round(p.color.r + 60)}, ${Math.round(p.color.g + 60)}, ${Math.round(p.color.b + 60)}, ${p.alpha})`;
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ── UTILITY ──────────────────────────────────────────────
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 128, g: 128, b: 128 };
}

// ── PRELOAD IMAGES ───────────────────────────────────────
function preloadImages() {
  products.forEach(p => {
    const img = new Image();
    img.src = p.image;
  });
}

// ── START ────────────────────────────────────────────────
preloadImages();

// Initial state — start with floating
shoeImg.classList.add('floating');

document.addEventListener('DOMContentLoaded', init);
