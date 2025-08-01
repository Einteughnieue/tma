document.addEventListener('DOMContentLoaded', function () {
    
    // --- ДАННЫЕ О ТОВАРАХ ---
    const products = [
        {
            displayTitle: 'Фиточай #1',
            fullName: 'Название Товара 1',
            description: 'Описание для первого фиточая. Помогает расслабиться и найти гармонию после тяжелого дня.',
            image: 'img/tea1.png' 
        },
        {
            displayTitle: 'Фиточай #2',
            fullName: 'Название Товара 2',
            description: 'Это описание для второго товара. Он отлично бодрит и заряжает энергией на весь день.',
            image: 'img/tea2.png'
        },
        {
            displayTitle: 'Фиточай #3',
            fullName: 'Название Товара 3',
            description: 'Третий фиточай создан для улучшения пищеварения и общего тонуса организма.',
            image: 'img/tea3.png'
        },
        {
            displayTitle: 'Фиточай #4',
            fullName: 'Название Товара 4',
            description: 'Четвертый товар. Укрепляет иммунитет и помогает организму бороться с простудой.',
            image: 'img/tea4.png'
        },
        {
            displayTitle: 'Фиточай #5',
            fullName: 'Название Товара 5',
            description: 'Пятый вариант, который способствует очищению и детоксикации.',
            image: 'img/tea5.png'
        }
    ];

    // --- ПОЛУЧАЕМ ЭЛЕМЕНТЫ СО СТРАНИЦЫ ---
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    const productImage = document.getElementById('product-image-display');
    const productTitle = document.getElementById('product-title-display');
    const productFullName = document.getElementById('product-name-full');
    const productDescription = document.getElementById('product-description-full');

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
    let currentIndex = 0; 
    function updateProductView() {
        const product = products[currentIndex];
        productTitle.textContent = product.displayTitle;
        productFullName.textContent = product.fullName;
        productDescription.textContent = product.description;

        if (product.image) {
            productImage.src = product.image;
            productImage.alt = product.fullName;
            productImage.style.display = 'block';
        } else {
            productImage.style.display = 'none';
        }
    }

    nextButton.addEventListener('click', () => {
        currentIndex++;
        if (currentIndex >= products.length) {
            currentIndex = 0;
        }
        updateProductView();
    });

    prevButton.addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = products.length - 1;
        }
        updateProductView();
    });

    updateProductView();
});