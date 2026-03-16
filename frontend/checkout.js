const BACKEND_URL = 'http://127.0.0.1:8000/api';   
const paymentOptions = document.querySelectorAll('.payment-option');
let selectedMethod = "Card";

// Highlight selected payment method visually
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

    // Popup show karein "Processing..."
    const popup = document.getElementById("popup");
    const popupBox = document.querySelector(".popup-box");
    
    // Reset popup HTML in case of multiple clicks
    popupBox.innerHTML = `<h3>Processing Payment...</h3><p>Please wait</p>`;
    popup.style.display = "flex";

    // 2 Seconds delay as requested
    setTimeout(async () => {
        popupBox.innerHTML = "<div class='success'>Payment Successful</div><p>Thank you for your purchase</p>";
        
        try {
            // Backend me save karke Download Token mangwana
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
                // Thodi der baad thank you page par bhej do
                setTimeout(() => {
                    window.location.href = `thank-you.html?token=${data.token}`;
                }, 1500);
            } else {
                alert("Error: " + data.message);
                popup.style.display = "none";
            }
        } catch (error) {
            console.error("API error: ", error);
            alert("Network error, please try again.");
            popup.style.display = "none";
        }
    }, 2000);
}