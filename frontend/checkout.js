document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Page reload hone se rokna

    // Form ka data collect karna
    const name = document.querySelector('input[name="name"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    const payBtn = document.querySelector('.btn-pay');

    payBtn.innerHTML = "Processing...";

    // API ko data bhejna
    fetch('http://127.0.0.1:8000/api/create-order/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, email: email, phone: phone })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Order successfully create ho gaya! (Order ID: " + data.order_id + ")");
                // Yahan hum baad mein Razorpay ka code lagayenge
                // Abhi ke liye thank you page par bhej dete hain
                window.location.href = "thank-you.html";
            } else {
                alert("Error: " + data.message);
                payBtn.innerHTML = "Proceed to Pay ₹299";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Kuch galat ho gaya, kripya baad mein try karein.");
            payBtn.innerHTML = "Proceed to Pay ₹299";
        });
});