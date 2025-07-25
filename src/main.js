// ================== ФАЙЛ: /src/main.js (ФІНАЛЬНА Повна Версія) ================== */

// ІМПОРТУЄМО SWIPER, ЯК ТИ І ХОТІВ
import Swiper from 'swiper';
import 'swiper/css'; // Vite сам "зрозуміє" цей CSS і додасть на сторінку
import './style.css'; // Імпортуємо наші головні стилі

document.addEventListener('DOMContentLoaded', () => {
    // ----------------- ІНІЦІАЛІЗАЦІЯ І DOM ЕЛЕМЕНТИ -----------------
    const tg = window.Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }

    const authScreen = document.getElementById('auth-screen'), appMain = document.getElementById('app-main'), authGifBackground = document.getElementById('auth_gif_background'), pageWrapper = document.querySelector('.page-wrapper'), navButtons = document.querySelectorAll('.nav-btn'), productsSliderWrapper = document.getElementById('products-slider-wrapper'), nameInput = document.getElementById('auth-name'), surnameInput = document.getElementById('auth-surname'), phoneInput = document.getElementById('auth-phone'), sharePhoneBtn = document.getElementById('share-phone-btn'), authLaterBtn = document.getElementById('auth-later-btn'), authConfirmBtn = document.getElementById('auth-confirm-btn'), productBox = document.getElementById('product-box'), addToCart3DBtn = document.getElementById('add-to-cart-3d-btn'), interactionZone = document.querySelector('.interaction-zone'), cartPanel = document.getElementById('cart-panel'), cartPanelPreviews = document.getElementById('cart-panel-previews'), cartTotalPrice = document.getElementById('cart-total-price');
    let allProducts = [], cart = [], currentUser = {}, isAuthorized = false, current3DProductIndex = -1, productSwiper, isInteracting = false, isDragging = false, isPinching = false, previousX, previousY, rotationX = -20, rotationY = -30, scale = 1.0, returnTimeout;
    const DEFAULT_ROTATION_X = -20, DEFAULT_ROTATION_Y = -30, DEFAULT_SCALE = 1.0, RETURN_DELAY = 2000;

    // ----------------- ОСНОВНІ ФУНКЦІЇ -----------------
    function startApp(config) {
        isAuthorized = config.authorized || false;
        if (isAuthorized) currentUser = config.user;
        authScreen.classList.remove('visible'); authGifBackground.style.opacity = '0';
        setTimeout(() => { appMain.classList.remove('hidden'); appMain.style.opacity = '1'; authGifBackground.style.display = 'none'; }, 500);
        initializeMainApp();
    }
    function initializeMainApp() { goToPage(1); fetchAndRenderPreviews(); updateCart(); }
    function goToPage(pageIndex) { if (pageWrapper) pageWrapper.style.transform = `translateX(-${pageIndex * 100 / 3}%)`; navButtons.forEach((btn, idx) => btn.classList.toggle('active', idx === pageIndex)); }
    function addToCart(productId) {
        const productToAdd = allProducts.find(p => p.id === productId);
        if (productToAdd) { cart.push(productToAdd); updateCart(); tg?.HapticFeedback.notificationOccurred('success'); }
    }
    function updateCart() {
        cartPanel.classList.toggle('visible', cart.length > 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalPrice.textContent = `${totalPrice.toFixed(2)} грн`;
        cartPanelPreviews.innerHTML = `<div class="cart-panel-previews-item"><img src="/${item.image_url}" alt=""></div>`;
    }
    async function fetchAndRenderPreviews() {
        try {
            allProducts = await fetch('/api/products').then(res => res.json());
            productsSliderWrapper.innerHTML = '';
            allProducts.forEach(product => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `<div class="product-preview" data-product-id="${product.id}"><img class="product-preview-img" src="/${product.image_url}" alt="${product.name_ua}"><div class="product-preview-info"><h3>${product.name_ua}</h3><p class="short-description">${product.description_short_ua || ''}</p><p class="full-description">${product.description_ua || ''}</p></div></div>`;
                productsSliderWrapper.appendChild(slide);
            });
            initSwiper();
            if (allProducts.length > 0) update3DView(0);
        } catch(e) { console.error(e); }
    }
    function initSwiper() {
        productSwiper = new Swiper('.product-slider', {
            effect: 'coverflow', grabCursor: true, centeredSlides: true, loop: true, slidesPerView: 3,
            coverflowEffect: { rotate: 0, stretch: 40, depth: 150, modifier: 1, slideShadows: false, },
            on: { slideChange: function() { const activeSlide = this.slides[this.activeIndex]; if (!activeSlide) return; const preview = activeSlide.querySelector('.product-preview'); if (!preview) return; const productId = parseInt(preview.dataset.productId); const productIndex = allProducts.findIndex(p => p.id === productId); if(productIndex > -1) update3DView(productIndex); } }
        });
    }
    function update3DView(productIndex) {
        if (productIndex < 0 || productIndex >= allProducts.length) return; current3DProductIndex = productIndex;
        document.querySelectorAll('.product-preview').forEach(el => el.classList.remove('active-slide-preview'));
        const activeSlide = productsSliderWrapper.querySelector(`[data-product-id='${allProducts[productIndex].id}']`); activeSlide?.classList.add('active-slide-preview');
        const product = allProducts[current3DProductIndex], sides = product.image_sides.split(','); if (sides.length < 6) return;
        productBox.querySelector('.front').style.backgroundImage = `url(/${sides[0]})`; productBox.querySelector('.back').style.backgroundImage = `url(/${sides[1]})`; productBox.querySelector('.left').style.backgroundImage = `url(/${sides[2]})`; productBox.querySelector('.right').style.backgroundImage = `url(/${sides[3]})`; productBox.querySelector('.top').style.backgroundImage = `url(/${sides[4]})`; productBox.querySelector('.bottom').style.backgroundImage = `url(/${sides[5]})`;
        addToCart3DBtn.textContent = 'Додати';
    }
    function updateTransform() { productBox.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`; }
    function resetToDefaultPosition() { productBox.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'; rotationX = DEFAULT_ROTATION_X; rotationY = DEFAULT_ROTATION_Y; scale = DEFAULT_SCALE; updateTransform(); }
    function scheduleReturnToDefault() { clearTimeout(returnTimeout); returnTimeout = setTimeout(resetToDefaultPosition, RETURN_DELAY); }
    function handleDragStart(x, y) { isDragging = true; previousX = x; previousY = y; }
    function handleDragMove(x, y) { if (!isDragging) return; rotationY += (x - previousX) * 0.5; rotationX -= (y - previousY) * 0.5; rotationX = Math.max(-60, Math.min(20, rotationX)); updateTransform(); previousX = x; previousY = y; }
    let initialPinchDistance = 0;
    function getPinchDistance(touches) { return Math.hypot(touches[0].clientX-touches[1].clientX, touches[0].clientY-touches[1].clientY); }
    function handleInteractionStart(e) { e.preventDefault(); clearTimeout(returnTimeout); productBox.style.transition = 'none'; if (e.touches && e.touches.length === 2 && !isInteracting) { isPinching = true; isInteracting = true; initialPinchDistance = getPinchDistance(e.touches); } else if (e.touches && e.touches.length === 1 && !isInteracting) { isDragging = true; isInteracting = true; handleDragStart(e.touches[0].clientX, e.touches[0].clientY); } else if (!e.touches && !isInteracting) { isDragging = true; isInteracting = true; handleDragStart(e.clientX, e.clientY); } }
    function handleInteractionMove(e) { e.preventDefault(); if (isPinching && e.touches && e.touches.length === 2) { const newDist = getPinchDistance(e.touches); scale += (newDist - initialPinchDistance) * 0.005; scale = Math.max(0.8, Math.min(2.0, scale)); updateTransform(); initialPinchDistance = newDist; } else if (isDragging && e.touches && e.touches.length === 1) { handleDragMove(e.touches[0].clientX, e.touches[0].clientY); } else if (isDragging && !e.touches) { handleDragMove(e.clientX, e.clientY); } }
    function handleInteractionEnd(e) { e.preventDefault(); if (isInteracting) { isInteracting = isDragging = isPinching = false; scheduleReturnToDefault(); } }

    if (tg?.initDataUnsafe?.user) { currentUser.id = tg.initDataUnsafe.user.id; nameInput.value = tg.initDataUnsafe.user.first_name || ""; }
    authLaterBtn.addEventListener('click', () => startApp({ authorized: false }));
    authConfirmBtn.addEventListener('click', () => { startApp({ authorized: true }); });
    navButtons.forEach((button, index) => button.addEventListener('click', () => goToPage(index)));
    addToCart3DBtn.addEventListener('click', () => { if(current3DProductIndex > -1) addToCart(allProducts[current3DProductIndex].id); });
    interactionZone.addEventListener('mousedown', handleInteractionStart);
    window.addEventListener('mousemove', handleInteractionMove); window.addEventListener('mouseup', handleInteractionEnd);
    interactionZone.addEventListener('touchstart', handleInteractionStart, { passive: false });
    interactionZone.addEventListener('touchmove', handleInteractionMove, { passive: false });
    interactionZone.addEventListener('touchend', handleInteractionEnd, { passive: false });
});