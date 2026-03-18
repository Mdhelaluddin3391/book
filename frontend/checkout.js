const BACKEND_URL = CONFIG.BACKEND_URL;
const paymentOptions = document.querySelectorAll('.payment-option');
let selectedMethod = "Card";

// Payment method visually select karne ke liye
paymentOptions.forEach(opt => {
    opt.addEventListener('click', function () {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        paymentOptions.forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        selectedMethod = this.dataset.method;
    });
});

// Single aur correct payNow function
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
                payment_method: selectedMethod
            })
        });
        
        const data = await response.json();
        
        if(data.status === 'success') {
            // Backend se aayi hui payment link par redirect karein
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
// =========================================
// --- DYNAMIC PRICE FETCH LOGIC ---
// =========================================
document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Backend se product details fetch karo
        const response = await fetch(`${BACKEND_URL}/product-details/`);
        const data = await response.json();
        
        // Check karein ki data mein selling price aur mrp dono hain ya nahi
        if (data && data.price_inr && data.mrp_inr) {
            const finalPrice = parseFloat(data.price_inr);
            const basePrice = parseFloat(data.mrp_inr); // <-- Backend se aayi hui MRP
            
            // Discount amount dynamically calculate ho raha hai
            const discountAmount = basePrice - finalPrice;

            // HTML elements ko update karo
            document.getElementById('base-price').innerText = `₹${basePrice}`;
            document.getElementById('discount-price').innerText = `- ₹${discountAmount}`;
            document.getElementById('final-price').innerText = `₹${finalPrice}`;
        }
    } catch (error) {
        console.error("Error fetching dynamic price on checkout:", error);
    }
});