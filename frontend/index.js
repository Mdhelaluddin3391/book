// frontend/index.js

document.addEventListener("DOMContentLoaded", async function() {
    const productContainer = document.getElementById("product-container");
    
    try {
        // Backend API ko hit karke sabhi products ki list la rahe hain
        const response = await fetch(`${CONFIG.BACKEND_URL}/product-details/`);
        const data = await response.json();

        // Grid ke "Loading..." text ko hata dete hain
        productContainer.innerHTML = "";

        // Agar database mein products hain
        if (data && data.products && data.products.length > 0) {
            
            // Har product ke liye ek card banayenge
            data.products.forEach(product => {
                
                // Agar product active hai toh 'View Details', warna 'Coming Soon'
                const btnClass = product.is_active ? "btn-view" : "btn-view disabled";
                const btnText = product.is_active ? "View Details" : "Coming Soon";
                const btnStyle = product.is_active ? "" : "background: #ccc; cursor: not-allowed; pointer-events: none;";
                const productLink = product.is_active ? "workbook.html" : "#";

                const cardHTML = `
                    <div class="product-card">
                        <img src="${product.image_url}" alt="${product.name}" class="product-img">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <div class="price-row">
                                <span class="price">$${parseFloat(product.price_usd).toFixed(2)}</span>
                                <a href="${productLink}" class="${btnClass}" style="${btnStyle}">${btnText}</a>
                            </div>
                        </div>
                    </div>
                `;
                productContainer.innerHTML += cardHTML;
            });
            
        } else {
            productContainer.innerHTML = "<p>No products available right now. Please check back later!</p>";
        }

    } catch (error) {
        console.error("Error fetching products:", error);
        productContainer.innerHTML = "<p>Failed to load products. Please check your internet or backend server.</p>";
    }
});