const BACKEND_URL = CONFIG.BACKEND_URL;
const paymentOptions = document.querySelectorAll('.payment-option');
let selectedMethod = "Card";

// Naya Code: URL se product ID nikalna
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

paymentOptions.forEach(opt => {
    opt.addEventListener('click', function () {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        paymentOptions.forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        selectedMethod = this.dataset.method;
    });
});

async function payNow() {
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();

    if (name === "" || email === "" || phone === "") {
        alert("Please fill Name, Email, and Phone number first.");
        return;
    }

    const popup = document.getElementById("popup");
    const popupBox = document.querySelector(".popup-box");

    popupBox.innerHTML = `<h3>Processing Order...</h3><p>Redirecting to secure gateway...</p>`;
    popup.style.display = "flex";

    try {
        const response = await fetch(`${BACKEND_URL}/process-payment/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                payment_method: selectedMethod,
                product_id: productId // Naya Code: Product ID backend bhejna
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            window.location.href = data.payment_url;
        } else {
            popupBox.innerHTML = `
                <h3 style="color:red;">Order Failed</h3>
                <p>${data.message}</p>
                <button onclick="document.getElementById('popup').style.display='none'" style="margin-top:15px; padding:8px 20px; cursor:pointer;">Close</button>
            `;
        }
    } catch (error) {
        console.error("API error: ", error);
        popupBox.innerHTML = `
            <h3 style="color:red;">Network Error</h3>
            <p>Django server se connect nahi ho pa raha hai. Kripya backend server chalu karein.</p>
            <button onclick="document.getElementById('popup').style.display='none'" style="margin-top:15px; padding:8px 20px; cursor:pointer;">Close</button>
        `;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch(`${BACKEND_URL}/product-details/`);
        const data = await response.json();

        if (data && data.products && data.products.length > 0) {
            let product = data.products[0]; 
            
            // Naya Code: Agar URL me ID hai toh correct product select karna
            if (productId) {
                const foundProduct = data.products.find(p => p.id == productId);
                if (foundProduct) {
                    product = foundProduct;
                }
            }
            
            const finalPrice = parseFloat(product.price_usd);
            const basePrice = parseFloat(product.mrp_usd);
            const discountAmount = (basePrice - finalPrice).toFixed(2);

            const productNameEl = document.getElementById('checkout-product-name');
            if (productNameEl) {
                productNameEl.innerText = product.name + " (PDF)";
            }
            
            document.getElementById('base-price').innerText = `$${basePrice.toFixed(2)}`;
            document.getElementById('discount-price').innerText = `- $${discountAmount}`;
            document.getElementById('final-price').innerText = `$${finalPrice.toFixed(2)}`;
        }
    } catch (error) {
        console.error("Error fetching dynamic price on checkout:", error);
    }
});

//chackkout agremnt
document.addEventListener("DOMContentLoaded", function () {
    const refundCheckbox = document.getElementById('agree-refund');
    const payButton = document.getElementById('main-pay-button');

    if (refundCheckbox && payButton) {
        refundCheckbox.addEventListener('change', function () {
            if (this.checked) {
                payButton.disabled = false;
                payButton.style.opacity = '1';
            } else {
                payButton.disabled = true;
                payButton.style.opacity = '0.6';
            }
        });
    }
});