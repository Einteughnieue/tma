document.addEventListener('DOMContentLoaded', function () {
    const sheetHandle = document.getElementById('sheet-handle');
    const bottomSheet = document.querySelector('.bottom-sheet');

    // --- ЛОГИКА ШТОРКИ (BOTTOM SHEET) ---
    // Эта логика остается простой: клик по ручке переключает класс 'open'
    sheetHandle.addEventListener('click', () => {
        bottomSheet.classList.toggle('open');
    });


    // --- ИНИЦИАЛИЗАЦИЯ И НАСТРОЙКА SWIPER.JS ---
    const swiper = new Swiper('.swiper', {
        // Эффект "coverflow" создает красивое 3D-перекрытие слайдов
        effect: 'coverflow',
        
        // Включаем "захват" слайдера курсором/пальцем
        grabCursor: true,

        // !! Активный слайд всегда будет в центре !!
        centeredSlides: true,

        // !! Бесконечная прокрутка слайдера !!
        loop: true,

        // Количество видимых слайдов. 'auto' позволяет слайдам иметь разную ширину
        // и подстраивает их количество. В нашем случае ширина фиксированная,
        // но 'auto' - лучшая практика для centeredSlides.
        slidesPerView: 'auto',

        // !! Клик по соседнему (частично видимому) слайду сделает его активным !!
        slideToClickedSlide: true,

        // Настройки для эффекта "coverflow"
        coverflowEffect: {
            rotate: 0,       // Не поворачиваем слайды по оси Y
            stretch: 80,     // Расстояние между слайдами (влияет на "тягучесть")
            depth: 200,      // Глубина эффекта (влияет на масштаб неактивных слайдов)
            modifier: 1,     // Множитель эффекта
            slideShadows: false, // Отключаем тени, т.к. у нас свои
        },

        // !! Настройка "тягучести" и чувствительности !!
        // Уменьшаем "упругость" на краях. Чем меньше значение, тем сложнее
        // перетащить слайдер за пределы (актуально без loop:true)
        resistanceRatio: 0.85,

        // !! Подключаем стрелки навигации, которые мы добавили в HTML !!
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        // Здесь можно добавить другие модули, например, пагинацию
        // pagination: {
        //   el: '.swiper-pagination',
        // },
    });

    // --- Пример обновления информации о товаре при смене слайда ---
    // (для демонстрации)

    const productTitle = document.querySelector('.product-title-full');
    const productDescription = document.querySelector('.product-description');
    
    // Массив с данными о товарах (в реальном проекте это может приходить с сервера)
    const productsData = [
        { name: "Фиточай #1", description: "Описание для фиточая номер один. Успокаивает и расслабляет." },
        { name: "Фиточай #2", description: "Описание для фиточая номер два. Бодрит и тонизирует." },
        { name: "Фиточай #3", description: "Описание для фиточая номер три. Улучшает пищеварение." },
        { name: "Фиточай #4", description: "Описание для фиточая номер четыре. Повышает иммунитет." },
        { name: "Фиточай #5", description: "Описание для фиточая номер пять. Очищает организм." },
    ];

    function updateProductInfo(index) {
        // Учитываем, что в режиме `loop` Swiper создает дубликаты слайдов.
        // `realIndex` всегда показывает правильный индекс оригинального слайда.
        const product = productsData[index];
        if (product) {
            productTitle.textContent = product.name;
            productDescription.textContent = product.description;
        }
    }
    
    // Вызываем обновление информации при инициализации
    updateProductInfo(swiper.realIndex);

    // Добавляем слушатель событий на смену слайда
    swiper.on('slideChange', function () {
        updateProductInfo(swiper.realIndex);
    });

});