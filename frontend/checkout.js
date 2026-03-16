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

    // 1. Popup show karein "Processing..."
    const popup = document.getElementById("popup");
    const popupBox = document.querySelector(".popup-box");
    
    popupBox.innerHTML = `<h3>Processing Payment...</h3><p>Please wait</p>`;
    popup.style.display = "flex";

    try {
        // 2. Fake delay for realistic feeling (1.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Backend ko data bhejo
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
        
        // 4. Check karo ki backend ne success bola ya nahi
        if(data.status === 'success') {
            // Success hone par message dikhao aur redirect karo
            popupBox.innerHTML = "<div class='success'>✅ Payment Successful</div><p>Redirecting to your download...</p>";
            
            setTimeout(() => {
                // Seedha thank-you page par bhejo with token
                window.location.href = `thank-you.html?token=${data.token}`;
            }, 1000);
        } else {
            // Agar backend se koi error aayi (jaise data galat ho)
            popupBox.innerHTML = `
                <h3 style="color:red;">Payment Failed</h3>
                <p>${data.message}</p>
                <button onclick="document.getElementById('popup').style.display='none'" style="margin-top:15px; padding:8px 20px; cursor:pointer;">Close</button>
            `;
        }
    } catch (error) {
        // Agar Django server band hai ya Network issue hai
        console.error("API error: ", error);
        popupBox.innerHTML = `
            <h3 style="color:red;">Network Error</h3>
            <p>Django server se connect nahi ho pa raha hai. Please apna backend server chalu karein.</p>
            <button onclick="document.getElementById('popup').style.display='none'" style="margin-top:15px; padding:8px 20px; cursor:pointer;">Close</button>
        `;
    }
}


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
            // REAL INDUSTRY FLOW: Direct thank you nahi, Payment Gateway URL par bhejo
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
            <p>Django server se connect nahi ho pa raha hai.</p>
            <button onclick="document.getElementById('popup').style.display='none'" style="margin-top:15px; padding:8px 20px; cursor:pointer;">Close</button>
        `;
    }
}