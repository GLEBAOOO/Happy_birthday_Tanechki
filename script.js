const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* =========================================================
   ЕДИНЫЙ КОНТРОЛЛЕР МОДАЛЬНОГО ОКНА
   Три режима: одно фото, галерея детства, видео
   ========================================================= */
(() => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const box = lightbox.querySelector('.lightbox__box');
  const closeButton = lightbox.querySelector('.lightbox__close');
  const image = document.getElementById('lightboxImage');
  const title = document.getElementById('lightboxTitle');
  const counter = document.getElementById('memory-counter');
  const prevButton = document.getElementById('memory-prev');
  const nextButton = document.getElementById('memory-next');
  const gallery = lightbox.querySelector('.memory-gallery');
  const video = document.getElementById('lightboxVideo');

  const galleryButton = document.getElementById('open-memory-gallery');
  const videoButton = document.getElementById('show-video');
  const headerLinks = document.querySelectorAll('.header__list-link[data-image]');

  // Фото детства (кнопка «Посмотреть фотографии»)
  const photos = [
    'img/2.5.1.jpg',
    'img/2.5.2.jpg',
    'img/2.5.3.jpg',
    'img/2.5.4.jpg',
    'img/2.5.5.jpg',
    'img/2.5.6.jpg'
  ];

  const SLIDE_INTERVAL = 3000;

  let activePhotos = photos;
  let current = 0;
  let slideTimer = null;
  let clearSrcTimer = null;
  let lastFocused = null;

  const isOpen = () => lightbox.classList.contains('is-open');

  function setNavVisible(visible) {
    [prevButton, nextButton, counter].forEach((el) => {
      if (el) el.hidden = !visible;
    });
  }

  function showPhoto(index) {
    current = (index + activePhotos.length) % activePhotos.length;
    image.src = activePhotos[current];
    image.alt = `Фотография ${current + 1} из ${activePhotos.length}`;
    counter.textContent = `${current + 1} из ${activePhotos.length}`;
  }

  function stopSlideshow() {
    if (slideTimer !== null) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  function startSlideshow() {
    stopSlideshow();
    if (reduceMotion.matches) return;
    slideTimer = setInterval(() => showPhoto(current + 1), SLIDE_INTERVAL);
  }

  function resetModes() {
    stopSlideshow();
    clearTimeout(clearSrcTimer);

    video.pause();
    video.hidden = true;
    activePhotos = photos;
    gallery.hidden = false;
    setNavVisible(false);
    counter.textContent = '';
    lightbox.classList.remove('is-video');
    if (videoButton) videoButton.setAttribute('aria-expanded', 'false');
  }

  function openModal({ type, src, titleText }) {
    resetModes();
    lastFocused = document.activeElement;

    if (type === 'gallery') {
      showPhoto(0);
      setNavVisible(true);
      title.textContent = 'Наши фотографии';
      startSlideshow();
    } else if (type === 'video') {
      video.hidden = false;
      gallery.hidden = true;
      title.textContent = 'Наше видео';
      lightbox.classList.add('is-video');
      if (videoButton) videoButton.setAttribute('aria-expanded', 'true');
      video.currentTime = 0;
      video.play().catch(() => {
        // Автозапуск может быть запрещён — пользователь включит видео вручную.
      });
    } else {
      image.src = src;
      image.alt = titleText || '';
      title.textContent = titleText || '';
    }

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  }

  function closeModal() {
    if (!isOpen()) return;

    stopSlideshow();
    video.pause();
    video.hidden = true;
    lightbox.classList.remove('is-open', 'is-video');
    lightbox.setAttribute('aria-hidden', 'true');
    if (videoButton) videoButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Очищаем src только после анимации закрытия и только если окно не открыли снова.
    clearSrcTimer = setTimeout(() => {
      if (!isOpen()) {
        image.removeAttribute('src');
        image.alt = '';
      }
    }, 350);

    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }

  headerLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (!link.dataset.image) return;
      openModal({
        type: 'image',
        src: link.dataset.image,
        titleText: link.dataset.title
      });
    });
  });

  galleryButton?.addEventListener('click', () => openModal({ type: 'gallery' }));
  videoButton?.addEventListener('click', () => openModal({ type: 'video' }));

  prevButton?.addEventListener('click', () => {
    showPhoto(current - 1);
    startSlideshow();
  });

  nextButton?.addEventListener('click', () => {
    showPhoto(current + 1);
    startSlideshow();
  });

  lightbox.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    // Удерживаем фокус внутри диалога
    if (event.key === 'Tab' && box) {
      const focusable = Array.from(
        box.querySelectorAll('button, video, [href], [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hidden && el.getClientRects().length > 0);

      if (!focusable.length) return;

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
})();

/* =========================================================
   ШАРИКИ ПОД АРКАМИ
   ========================================================= */
document.querySelector('#another-gift')?.addEventListener('click', (event) => {
  event.preventDefault();

  if (reduceMotion.matches || document.querySelector('.balloon-burst')) return;

  const burst = document.createElement('div');
  burst.className = 'balloon-burst';
  burst.setAttribute('aria-hidden', 'true');
  document.body.appendChild(burst);

  function launchParty() {
    for (let i = 0; i < 25; i++) {
      const balloon = document.createElement('span');
      balloon.className = 'balloon';
      balloon.style.setProperty('--left', `${Math.random() * 100}%`);
      balloon.style.setProperty('--size', `${65 + Math.random() * 45}px`);
      balloon.style.setProperty('--delay', `${Math.random() * 1.2}s`);
      balloon.style.setProperty('--duration', `${6 + Math.random() * 2}s`);
      burst.appendChild(balloon);
    }
  }

  launchParty();
  setTimeout(launchParty, 5000);
  setTimeout(() => burst.remove(), 16000);
});

/* =========================================================
   ПРОКРУТКА
   ========================================================= */
const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

document.querySelector('#scroll-to-beginning')?.addEventListener('click', () => {
  document.querySelector('#beginning')?.scrollIntoView({
    behavior: scrollBehavior(),
    block: 'start'
  });
});

document.querySelector('#back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
});

/* =========================================================
   ЛЕТАЮЩИЕ СЕРДЕЧКИ РОДИТЕЛЯМ
   ========================================================= */
document.querySelector('#parents-heart')?.addEventListener('click', (event) => {
  if (reduceMotion.matches) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const heart = document.createElement('span');

  heart.className = 'floating-heart';
  heart.textContent = '♥';
  heart.style.left = `${rect.left + rect.width / 2}px`;
  heart.style.top = `${rect.top}px`;
  heart.style.setProperty('--drift', `${Math.random() * 70 - 35}px`);

  document.body.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove(), { once: true });
});
