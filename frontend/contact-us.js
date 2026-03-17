
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Page ko reload hone se rokna
    const BACKEND_URL = CONFIG.BACKEND_URL;
    // Form ka data collect karna
    const name = document.querySelector('input[name="name"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const message = document.querySelector('textarea[name="message"]').value;
    const submitBtn = document.querySelector('.btn-submit');

    submitBtn.innerHTML = "Sending..."; // Button ka text change karna

    // API ko data bhejna
    fetch('BACKEND_URL/contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, email: email, message: message })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Thank you! Aapka message send ho gaya hai.");
                document.querySelector('form').reset(); // Form ko clear karna
            } else {
                alert("Error: " + data.message);
            }
            submitBtn.innerHTML = "Send Message";
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Kuch galat ho gaya, kripya baad mein try karein.");
            submitBtn.innerHTML = "Send Message";
        });
});
