console.log("Responsive Page Loaded Successfully!");


const categoriesData = [
    {
        title: "Identify the Object",
        images: [
            "https://images.unsplash.com/photo-1773573522021-762a92a4a4fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D", 
            "https://images.unsplash.com/photo-1773332585956-2d0e8ac80cb6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D", 
            "https://images.unsplash.com/photo-1773332611528-566f16120979?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyN3x8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1773820680905-befd32984b3f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzNHx8fGVufDB8fHx8fA%3D%3D" 
        ]
    },
    {
        title: "Match the Following",
        images: [
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60"
        ]
    },
    {
        title: "Count and Write",
        images: [
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500&auto=format&fit=crop&q=60"
        ]
    },
    {
        title: "Learn to Write",
        images: [
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1588534510807-86dfb5ed5d5b?w=500&auto=format&fit=crop&q=60"
        ]
    },
    {
        title: "Identify Body Parts",
        images: [
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60"
        ]
    },
    {
        title: "Count & Match",
        images: [
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60"
        ]
    },
    {
        title: "Color the Shapes",
        images: [
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60"
        ]
    },
    {
        title: "Tracing Practice",
        images: [
            "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60"
        ]
    }
];

const containerCards = document.querySelector('.cards-container');

if (containerCards) {
    categoriesData.forEach((category) => {
        const cardHTML = `
            <div class="card">
                <div class="image-container">
                    <div class="image-slider">
                        <img src="${category.images[0]}" alt="${category.title} 1">
                        <img src="${category.images[1]}" alt="${category.title} 2">
                        <img src="${category.images[2]}" alt="${category.title} 3">
                    </div>
                </div>
                <div class="card-label">${category.title}</div>
            </div>
        `;
        containerCards.innerHTML += cardHTML;
    });

    const sliders = document.querySelectorAll('.image-slider');
    
    sliders.forEach(slider => {
        let currentIndex = 0;
        
        setInterval(() => {
            currentIndex++;
            if (currentIndex >= 3) { 
                currentIndex = 0;
            }
            
            const translateXValue = currentIndex * 33.333;
            slider.style.transform = `translateX(-${translateXValue}%)`;
            
        }, 2500); 
    });
}


const track = document.getElementById('track');

if (track) {
    const dummyImages = [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1544716278-ca5e5f4cb5f1?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500&auto=format&fit=crop&q=60"
    ];

    track.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        track.innerHTML += `
            <div class="carousel-card">
                <img src="${dummyImages[i]}" alt="Sample ${i + 1}" class="carousel-image">
            </div>
        `;
    }

    const dots = document.querySelectorAll('.dot');
    const carouselCards = document.querySelectorAll('.carousel-card');
    let currentIndex = 0;

    function moveCarousel(index) {
        dots.forEach(d => d.classList.remove('active'));
        
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        const cardWidth = carouselCards[0].offsetWidth;
        const gap = 15; 

        const moveAmount = (cardWidth + gap) * index;
        track.style.transform = `translateX(-${moveAmount}px)`;
    }

    setInterval(() => {
        let cardsToShow = window.innerWidth > 768 ? 3 : (window.innerWidth > 480 ? 2 : 1);
        let maxIndex = carouselCards.length - cardsToShow;

        currentIndex++;
        
        if (currentIndex > maxIndex) {
            currentIndex = 0;
        }
        
        moveCarousel(currentIndex);
    }, 3000);

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.target.getAttribute('data-index'));
            moveCarousel(currentIndex);
        });
    });
}

const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {

        question.classList.toggle('active');

        const answer = question.nextElementSibling;

        if (question.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = 0;
        }
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    fetch(`${CONFIG.BACKEND_URL}/product-details/`)
        .then(response => response.json())
        .then(data => {
            if (data && data.products && data.products.length > 0) {
                let product = data.products[0];
                
                if (productId) {
                    const foundProduct = data.products.find(p => p.id == productId);
                    if (foundProduct) {
                        product = foundProduct;
                    }
                }
                
                const priceElements = document.querySelectorAll('.dynamic-price');
                priceElements.forEach(el => {
                    el.innerHTML = `Only $${product.price_usd}/- `;
                });

                const mainImage = document.getElementById('dynamic-hero-image');
                if (mainImage && product.image_url) {
                    mainImage.src = product.image_url;
                }

                const orderLinks = document.querySelectorAll('a[href="checkout.html"]');
                orderLinks.forEach(link => {
                    link.href = `checkout.html?id=${product.id}`;
                });
            }
        })
        .catch(err => console.error("Error fetching product details:", err));
});