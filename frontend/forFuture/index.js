document.addEventListener("DOMContentLoaded", async function() {
    const productContainer = document.getElementById("product-container");
    
    try {
        // Backend API ko hit karke details la rahe hain
        const response = await fetch(`${CONFIG.BACKEND_URL}/product-details/`);
        const data = await response.json();

        let dynamicProducts = [];

        // Agar data mil gaya, toh real product array mein daalo
        if (data && data.price_inr) {
            dynamicProducts.push({
                title: data.name,
                description: "500+ pages of tracing, counting, and logic activities for ages 3-8. Perfect for early development.",
                price: `₹${data.price_inr}`,
                image: "https://crevvo.com/wp-content/uploads/2024/02/14000-Kids-Worksheets.webp",
                link: "workbook.html", // Ispe click karke workbook.html pe jayenge
                is_active: true
            });
        }

        // Dummy/Upcoming Products (Taki grid achha dikhe, in future aap inko bhi DB me daal sakte ho)
        dynamicProducts.push(
            {
                title: "Math Master Bundle (Upcoming)",
                description: "Make addition, subtraction, and basic geometry fun with visual puzzles and coloring.",
                price: "₹199",
                image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60",
                link: "#",
                is_active: false // Yeh abhi ready nahi hai
            },
            {
                title: "Creative Art & Coloring (Upcoming)",
                description: "Unleash creativity with guided drawing, coloring pages, and shape recognition tasks.",
                price: "₹149",
                image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60",
                link: "#",
                is_active: false // Yeh bhi ready nahi hai
            }
        );

        // Grid ke "Loading..." text ko hata dete hain
        productContainer.innerHTML = "";

        // Ab array se data HTML mein render karo
        dynamicProducts.forEach(product => {
            // Agar PDF available nahi hai, toh button disabled jaisa dikhao
            const btnClass = product.is_active ? "btn-view" : "btn-view disabled";
            const btnText = product.is_active ? "View Details" : "Coming Soon";
            const btnStyle = product.is_active ? "" : "background: #ccc; cursor: not-allowed; pointer-events: none;";

            const cardHTML = `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.title}" class="product-img">
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p>${product.description}</p>
                        <div class="price-row">
                            <span class="price">${product.price}</span>
                            <a href="${product.link}" class="${btnClass}" style="${btnStyle}">${btnText}</a>
                        </div>
                    </div>
                </div>
            `;
            productContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        productContainer.innerHTML = "<p>Failed to load products. Please check your internet or backend server.</p>";
    }
});