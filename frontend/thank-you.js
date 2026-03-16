document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id'); // Stripe ke liye
    const token = urlParams.get('token');          // Sabke liye

    const downloadBtn = document.querySelector('.btn-download');

    if (sessionId) {
        // Stripe payment background mein verify kar rahe hain
        downloadBtn.innerHTML = "Verifying Payment...";
        downloadBtn.style.pointerEvents = "none";

        const res = await fetch('http://127.0.0.1:8000/api/verify-stripe/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
        });
        const data = await res.json();

        if (data.status === 'success') {
            downloadBtn.innerHTML = "📥 Download Worksheets Now";
            downloadBtn.style.pointerEvents = "auto";
            downloadBtn.href = `http://127.0.0.1:8000/api/download/${token}/`;
        } else {
            downloadBtn.innerHTML = "Payment Verification Failed";
            downloadBtn.style.backgroundColor = "red";
        }
    } else if (token) {
        // Razorpay/PayPal already verify hoke aaye hain
        downloadBtn.href = `http://127.0.0.1:8000/api/download/${token}/`;
    } else {
        downloadBtn.innerHTML = "Invalid Link";
        downloadBtn.style.backgroundColor = "red";
        downloadBtn.style.pointerEvents = "none";
    }
});