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

// Generate mock cards
if (track) {
    for (let i = 1; i <= 8; i++) {
        track.innerHTML += `
            <div class="carousel-card">
                <h3>Match It Up ${i}</h3>
                <p>Draw lines to match the numbers<br>and objects that go together.</p>
                <div class="mock-content">
                    <div class="mock-col">
                        <div class="mock-box">1</div>
                        <div class="mock-box">2</div>
                        <div class="mock-box">3</div>
                    </div>
                    <div class="mock-col">
                        <div class="mock-circle" style="background: #4caf50;"></div>
                        <div class="mock-circle" style="background: #2196f3;"></div>
                        <div class="mock-circle" style="background: #e91e63;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Carousel Sliding Logic
    const dots = document.querySelectorAll('.dot');
    const carouselCards = document.querySelectorAll('.carousel-card');

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            // Remove 'active' class from all dots
            dots.forEach(d => d.classList.remove('active'));

            // Add 'active' to the clicked dot
            const clickedDot = e.target;
            clickedDot.classList.add('active');

            // Find index of clicked dot
            const index = parseInt(clickedDot.getAttribute('data-index'));

            // Calculate card width and gap
            const cardWidth = carouselCards[0].offsetWidth;
            const gap = 15;

            // Move the track
            const moveAmount = (cardWidth + gap) * index;
            track.style.transform = `translateX(-${moveAmount}px)`;
        });
    });
}

// =========================================
// --- 3. MOBILE ADDICTION BUTTON JS ---
// =========================================
const buyButton = document.getElementById('buy-button');
if (buyButton) {
    buyButton.addEventListener('click', function () {
        alert("Thank you! Redirecting to the payment page for 199 INR...");
    });
}

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