// ================== ФАЙЛ: /src/main.js (ДІАГНОСТИЧНА ВЕРСІЯ) ================== */

import Swiper from 'swiper';
import 'swiper/css';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // --- Початкова ініціалізація, без змін ---
    const tg = window.Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }

    console.log("WebApp script started.");

    const appMain = document.getElementById('app-main');
    const productsSliderWrapper = document.getElementById('products-slider-wrapper');
    const productBox = document.getElementById('product-box');
    
    let allProducts = [];
    let productSwiper;

    // --- Логіка відображення, без змін ---
    function update3DView(productIndex) {
        if (productIndex < 0 || productIndex >= allProducts.length) {
            console.warn(`[DEBUG] Tried to update 3D view with invalid index: ${productIndex}`);
            return;
        }
        console.log(`[DEBUG] Updating 3D view for product index: ${productIndex}`);
        const product = allProducts[productIndex];
        productBox.querySelector('.front').style.backgroundImage = `url(/${product.image_sides.split(',')[0]})`;
    }

    // --- Ініціалізація Swiper з детальним логуванням ---
    function initSwiper() {
        console.log("[DEBUG] --- Starting Swiper Initialization ---");
        const sliderElement = document.querySelector('.product-slider');
        
        if (!sliderElement) {
            console.error("[FATAL DEBUG] Swiper container '.product-slider' not found in DOM!");
            return;
        }

        console.log("[DEBUG] Swiper container found. Number of slides to initialize:", productsSliderWrapper.children.length);
        if (productsSliderWrapper.children.length === 0) {
            console.warn("[DEBUG] No slides found inside .swiper-wrapper. Swiper might not initialize correctly.");
        }

        try {
            productSwiper = new Swiper(sliderElement, {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                loop: true,
                slidesPerView: 'auto',
                coverflowEffect: {
                    rotate: 0,
                    stretch: 10,
                    depth: 100,
                    modifier: 2.5,
                    slideShadows: false,
                },
                on: {
                    init: function () {
                        console.log("[SUCCESS DEBUG] Swiper initialized successfully!");
                    },
                    slideChange: function () {
                        const activeSlide = this.slides[this.activeIndex];
                        if (!activeSlide) return;
                        const preview = activeSlide.querySelector('.product-preview');
                        if (!preview) return;
                        const productId = parseInt(preview.dataset.productId);
                        const productIndex = allProducts.findIndex(p => p.id === productId);
                        console.log(`[DEBUG] Slide changed. Active product index: ${productIndex}`);
                        if (productIndex > -1) update3DView(productIndex);
                    }
                }
            });
        } catch (e) {
            console.error("[FATAL DEBUG] Error during Swiper initialization:", e);
        }
        console.log("[DEBUG] --- Swiper Initialization Finished ---");
    }
    
    // --- Завантаження товарів, без змін ---
    async function fetchAndRenderPreviews() {
        console.log("[DEBUG] Fetching products...");
        try {
            allProducts = await fetch('/api/products').then(res => res.json());
            console.log(`[DEBUG] Fetched ${allProducts.length} products.`);
            productsSliderWrapper.innerHTML = '';
            allProducts.forEach(product => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `<div class="product-preview" data-product-id="${product.id}"><img class="product-preview-img" src="/${product.image_url}" alt="${product.name_ua}"><div class="product-preview-info"><h3>${product.name_ua}</h3><p>${product.price.toFixed(2)} грн</p></div></div>`;
                productsSliderWrapper.appendChild(slide);
            });
            initSwiper();
            if (allProducts.length > 0) update3DView(0);
        } catch(e) { console.error("[FATAL DEBUG] Failed to fetch or render products:", e); }
    }

    // --- Запускаємо основну логіку ---
    function initializeMainApp() {
        fetchAndRenderPreviews();
    }
    
    // Імітуємо вхід як гість для тестування
    setTimeout(() => {
        appMain.classList.remove('hidden');
        appMain.style.opacity = '1';
        initializeMainApp();
    }, 500);

});