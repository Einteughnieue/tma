import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }

    const authScreen = document.getElementById('auth-screen'), appMain = document.getElementById('app-main'), authGifBackground = document.getElementById('auth_gif_background'), pageWrapper = document.querySelector('.page-wrapper'), navButtons = document.querySelectorAll('.nav-btn'), productsSliderWrapper = document.getElementById('products-slider-wrapper'), nameInput = document.getElementById('auth-name'), surnameInput = document.getElementById('auth-surname'), phoneInput = document.getElementById('auth-phone'), sharePhoneBtn = document.getElementById('share-phone-btn'), authLaterBtn = document.getElementById('auth-later-btn'), authConfirmBtn = document.getElementById('auth-confirm-btn'), productBox = document.getElementById('product-box'), addToCart3DBtn = document.getElementById('add-to-cart-btn'), interactionZone = document.querySelector('.interaction-zone');
    const bottomSheet = document.getElementById('bottom-sheet'), sheetToggleButton = document.getElementById('sheet-toggle-btn');
    const decreaseBtn = document.getElementById('decrease-quantity'), increaseBtn = document.getElementById('increase-quantity'), quantityCounter = document.getElementById('quantity-counter');
    const sideCart = document.getElementById('side-cart'), sideCartContent = document.getElementById('side-cart-content'), cartMiniaturesWrapper = document.getElementById('cart-miniatures-wrapper'), goToCartBtn = document.getElementById('go-to-cart-btn');
    const backToShopBtn = document.getElementById('back-to-shop-btn');
    
    let allProducts = [], cart = {}, currentUser = {}, isAuthorized = false, current3DProductIndex = -1, isInteracting = false, isDragging = false, isPinching = false, previousX, previousY, rotationX = -20, rotationY = -30, scale = 1.0, returnTimeout, cartHideTimeout;
    const DEFAULT_ROTATION_X = -20, DEFAULT_ROTATION_Y = -30, DEFAULT_SCALE = 1.0, RETURN_DELAY = 2000;
    let quantity = 1;
    let lastActivePage = 1;

    function startApp(config) {
        isAuthorized = config.authorized || false; if (isAuthorized) currentUser = config.user;
        authScreen.classList.remove('visible'); authGifBackground.style.opacity = '0';
        setTimeout(() => { appMain.classList.remove('hidden'); appMain.style.opacity = '1'; authGifBackground.style.display = 'none'; }, 500);
        initializeMainApp();
    }
    function initializeMainApp() { goToPage(1); fetchAndRenderPreviews(); updateCart(); }
    function goToPage(pageIndex) {
        if (pageIndex < 3) lastActivePage = pageIndex;
        if (pageWrapper) pageWrapper.style.transform = `translateX(-${pageIndex * 100 / 4}%)`;
        navButtons.forEach((btn, idx) => { btn.classList.toggle('active', idx === pageIndex); });
        tg?.HapticFeedback.impactOccurred('light');
    }
    function addToCart(productId, count) {
        if (!allProducts.find(p => p.id === productId)) return;
        if (cart[productId]) { cart[productId].count += count; } 
        else { cart[productId] = { product: allProducts.find(p => p.id === productId), count: count }; }
        updateCart(); showAndHideCart(); tg?.HapticFeedback.notificationOccurred('success');
        quantity = 1; quantityCounter.textContent = quantity;
    }
    function removeFromCart(productId) {
        if (cart[productId]) {
            cart[productId].count--;
            if (cart[productId].count <= 0) { delete cart[productId]; }
            updateCart();
        }
    }
    function updateCart() {
        const cartItems = Object.values(cart);
        const totalItems = cartItems.reduce((sum, item) => sum + item.count, 0);
        const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.count), 0);
        if(sideCartContent){
            if (totalItems === 0) { sideCartContent.innerHTML = 'Кошик порожній'; } 
            else { sideCartContent.innerHTML = `<strong>Всього: ${totalItems} шт.</strong><br><span>Сума: ${totalPrice.toFixed(2)} грн</span>`; }
        }
        if(cartMiniaturesWrapper){
            cartMiniaturesWrapper.querySelectorAll('.cart-miniature:not(.ellipsis)').forEach(m => m.remove());
            const maxVisible = Math.floor((cartMiniaturesWrapper.clientWidth - 60) / 58);
            const itemsToShow = cartItems.slice(0, maxVisible);
            itemsToShow.forEach(item => {
                const miniature = document.createElement('div');
                miniature.className = 'cart-miniature';
                const frontImage = item.product.image_sides.split(',')[0];
                miniature.style.backgroundImage = `url(/${frontImage})`;
                miniature.innerHTML = `<div class="miniature-counter">${item.count}</div>`;
                miniature.addEventListener('click', () => removeFromCart(item.product.id));
                cartMiniaturesWrapper.insertBefore(miniature, goToCartBtn);
            });
            goToCartBtn.style.display = 'flex';
        }
    }
    function showAndHideCart() {
        clearTimeout(cartHideTimeout);
        sideCart.classList.add('visible');
        cartHideTimeout = setTimeout(() => { sideCart.classList.remove('visible'); }, 2000);
    }
    async function fetchAndRenderPreviews() {
        try {
            allProducts = await fetch('/api/products').then(res => res.json());
            const clonedProducts = [...allProducts, ...allProducts, ...allProducts];
            productsSliderWrapper.innerHTML = '';
            clonedProducts.forEach(product => {
                const slide = document.createElement('div');
                slide.className = 'product-slide';
                slide.innerHTML = `<div class="product-preview" data-product-id="${product.id}"><div class="product-preview-info"><h3>${product.name_ua}</h3><p class="short-description">${product.description_short_ua || ''}</p></div></div>`;
                productsSliderWrapper.appendChild(slide);
            });
            setupSimpleScroller();
            if (allProducts.length > 0) update3DView(0);
        } catch(e) { console.error(e); }
    }
    
    function setupSimpleScroller() {
        const scroller = productsSliderWrapper;
        let scrollTimeout;
        const highlightCenter = () => {
            const scrollerRect = scroller.getBoundingClientRect();
            const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;
            let closestElement = null; let minDistance = Infinity;
            scroller.querySelectorAll('.product-slide').forEach(slide => {
                const slideRect = slide.getBoundingClientRect();
                const slideCenter = slideRect.left + slideRect.width / 2;
                const distance = Math.abs(scrollerCenter - slideCenter);
                if (distance < minDistance) { minDistance = distance; closestElement = slide; }
                slide.classList.remove('is-active');
            });
            if (closestElement) {
                closestElement.classList.add('is-active');
                const productId = parseInt(closestElement.querySelector('.product-preview').dataset.productId);
                const productIndex = allProducts.findIndex(p => p.id === productId);
                if (productIndex > -1 && productIndex !== current3DProductIndex) {
                    update3DView(productIndex);
                }
            }
        };
        
        const debouncedHighlight = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(highlightCenter, 100);
            
            const itemWidth = scroller.querySelector('.product-slide').offsetWidth;
            const scrollWidth = scroller.scrollWidth;
            const scrollLeft = scroller.scrollLeft;

            if (scrollLeft < itemWidth * allProducts.length) {
                scroller.scrollLeft += itemWidth * allProducts.length;
            }
            if (scrollLeft > itemWidth * allProducts.length * 2) {
                scroller.scrollLeft -= itemWidth * allProducts.length;
            }
        };
        scroller.addEventListener('scroll', debouncedHighlight);
        setTimeout(() => { 
            const itemWidth = scroller.querySelector('.product-slide').offsetWidth;
            scroller.scrollLeft = itemWidth * allProducts.length;
            highlightCenter();
        }, 100);
    }

    function update3DView(productIndexOrId) {
        const productIndex = Number.isInteger(productIndexOrId) ? productIndexOrId : allProducts.findIndex(p => p.id === productIndexOrId);
        if (productIndex < 0 || productIndex >= allProducts.length) return; 
        current3DProductIndex = productIndex;
        const product = allProducts[current3DProductIndex], sides = product.image_sides.split(','); if (sides.length < 6) return;
        productBox.querySelector('.front').style.backgroundImage = `url(/${sides[0]})`; productBox.querySelector('.back').style.backgroundImage = `url(/${sides[1]})`; productBox.querySelector('.left').style.backgroundImage = `url(/${sides[2]})`; productBox.querySelector('.right').style.backgroundImage = `url(/${sides[3]})`; productBox.querySelector('.top').style.backgroundImage = `url(/${sides[4]})`; productBox.querySelector('.bottom').style.backgroundImage = `url(/${sides[5]})`;
    }
    function updateTransform() { productBox.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`; }
    function resetToDefaultPosition() { productBox.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'; rotationX = DEFAULT_ROTATION_X; rotationY = DEFAULT_ROTATION_Y; scale = DEFAULT_SCALE; updateTransform(); }
    function scheduleReturnToDefault() { clearTimeout(returnTimeout); returnTimeout = setTimeout(resetToDefaultPosition, RETURN_DELAY); }
    function handleDragStart(x, y) { isDragging = true; previousX = x; previousY = y; }
    function handleDragMove(x, y) { if (!isDragging) return; rotationY += (x - previousX) * 0.5; rotationX -= (y - previousY) * 0.5; rotationX = Math.max(-60, Math.min(20, rotationX)); updateTransform(); previousX = x; previousY = y; }
    let initialPinchDistance = 0;
    function getPinchDistance(touches) { return Math.hypot(touches[0].clientX-touches[1].clientX, touches[0].clientY-touches[1].clientY); }
    function handleInteractionStart(e) { if (!bottomSheet.classList.contains('open')) { e.preventDefault(); clearTimeout(returnTimeout); productBox.style.transition = 'none'; if (e.touches && e.touches.length === 2 && !isInteracting) { isPinching = true; isInteracting = true; initialPinchDistance = getPinchDistance(e.touches); } else if (e.touches && e.touches.length === 1 && !isInteracting) { isDragging = true; isInteracting = true; handleDragStart(e.touches[0].clientX, e.touches[0].clientY); } else if (!e.touches && !isInteracting) { isDragging = true; isInteracting = true; handleDragStart(e.clientX, e.clientY); } } }
    function handleInteractionMove(e) { if (!bottomSheet.classList.contains('open')) { e.preventDefault(); if (isPinching && e.touches && e.touches.length === 2) { const newDist = getPinchDistance(e.touches); scale += (newDist - initialPinchDistance) * 0.005; scale = Math.max(0.8, Math.min(2.0, scale)); updateTransform(); initialPinchDistance = newDist; } else if (isDragging && e.touches && e.touches.length === 1) { handleDragMove(e.touches[0].clientX, e.touches[0].clientY); } else if (isDragging && !e.touches) { handleDragMove(e.clientX, e.clientY); } } }
    function handleInteractionEnd(e) { if (!bottomSheet.classList.contains('open')) { e.preventDefault(); if (isInteracting) { isInteracting = isDragging = isPinching = false; scheduleReturnToDefault(); } } }
    
    sheetToggleButton.addEventListener('click', () => { bottomSheet.classList.toggle('open'); tg?.HapticFeedback.impactOccurred('light'); });
    if (tg?.initDataUnsafe?.user) { currentUser.id = tg.initDataUnsafe.user.id; nameInput.value = tg.initDataUnsafe.user.first_name || ""; }
    authLaterBtn.addEventListener('click', () => startApp({ authorized: false }));
    authConfirmBtn.addEventListener('click', () => { startApp({ authorized: true }); });
    navButtons.forEach((button, index) => button.addEventListener('click', () => goToPage(index)));
    addToCart3DBtn.addEventListener('click', () => { if(current3DProductIndex > -1) addToCart(allProducts[current3DProductIndex].id, quantity); });
    decreaseBtn.addEventListener('click', ()=>{ if(quantity > 1){ quantity--; quantityCounter.textContent = quantity; }});
    increaseBtn.addEventListener('click', ()=>{ quantity++; quantityCounter.textContent = quantity; });
    
    goToCartBtn.addEventListener('click', () => goToPage(3));
    backToShopBtn.addEventListener('click', () => goToPage(lastActivePage));

    interactionZone.addEventListener('mousedown', handleInteractionStart);
    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    interactionZone.addEventListener('touchstart', handleInteractionStart, { passive: false });
    interactionZone.addEventListener('touchmove', handleInteractionMove, { passive: false });
    interactionZone.addEventListener('touchend', handleInteractionEnd, { passive: false });
});