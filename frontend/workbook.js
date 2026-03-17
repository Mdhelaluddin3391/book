console.log("Responsive Page Loaded Successfully!");

// =========================================
// --- 1. WORKSHEET CARDS WITH UNIQUE IMAGES ---
// =========================================

const categoriesData = [
    {
        title: "Identify the Object",
        images: [
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60", // Box 1 - Image 1
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60", // Box 1 - Image 2
            "https://images.unsplash.com/photo-1544716278-ca5e5f4cb5f1?w=500&auto=format&fit=crop&q=60"  // Box 1 - Image 3
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

// Generate 8 boxes with 3 UNIQUE images each
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

    // Auto-Scroll Logic for all sliders
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
            
        }, 2500); // 2.5 seconds mein scroll hoga
    });
}

// =========================================
// --- 2. CAROUSEL JAVASCRIPT ---
// =========================================
const track = document.getElementById('track');

if (track) {
    // 8 Dummy images ka array
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

    track.innerHTML = ''; // Purana content clear kar do

    // Har card ke andar 1 single image generate karna
    for (let i = 0; i < 8; i++) {
        track.innerHTML += `
            <div class="carousel-card">
                <img src="${dummyImages[i]}" alt="Sample ${i + 1}" class="carousel-image">
            </div>
        `;
    }

    // Carousel Sliding Logic (Auto Scroll & Dots)
    const dots = document.querySelectorAll('.dot');
    const carouselCards = document.querySelectorAll('.carousel-card');
    let currentIndex = 0;

    // Slide karne ka function
    function moveCarousel(index) {
        // 'active' class sabhi dots se hatao
        dots.forEach(d => d.classList.remove('active'));
        
        // Jo dot current hai usko 'active' karo
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        // Card ki width aur gap (15px) calculate karo
        const cardWidth = carouselCards[0].offsetWidth;
        const gap = 15; 

        // Track ko left shift karo
        const moveAmount = (cardWidth + gap) * index;
        track.style.transform = `translateX(-${moveAmount}px)`;
    }

    // Har 3 second mein auto-scroll (Left se Right)
    setInterval(() => {
        // Calculate karo screen par kitne cards dikh rahe hain
        let cardsToShow = window.innerWidth > 768 ? 3 : (window.innerWidth > 480 ? 2 : 1);
        let maxIndex = carouselCards.length - cardsToShow;

        currentIndex++;
        
        // Agar aakhri set par pahunch gaye, toh wapas 0 (start) par jao
        if (currentIndex > maxIndex) {
            currentIndex = 0;
        }
        
        moveCarousel(currentIndex);
    }, 3000); // 3000 milliseconds = 3 seconds

    // Agar koi manually dot par click kare toh:
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.target.getAttribute('data-index'));
            moveCarousel(currentIndex);
        });
    });
}

// =========================================
// --- 3. MOBILE ADDICTION BUTTON JS ---
// =========================================
// const buyButton = document.getElementById('buy-button');
// if (buyButton) {
//     buyButton.addEventListener('click', function () {
//         alert("Thank you! Redirecting to the payment page for 199 INR...");
//     });
// }

// =========================================
// --- 4. FAQ SECTION LOGIC ---
// =========================================
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {

        // Toggle 'active' class for rotating the icon
        question.classList.toggle('active');

        // Select the answer div
        const answer = question.nextElementSibling;

        // Open/Close logic using max-height
        if (question.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = 0;
        }
    });
});