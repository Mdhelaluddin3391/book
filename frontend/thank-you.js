document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');          
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');

    const downloadBtn = document.querySelector('.btn-download');

    if (token) {
        // Agar PayPal ki taraf se PayerID aayi hai, toh pehle payment verify karein
        if (paymentId && payerId) {
            downloadBtn.innerHTML = "Verifying Payment... Please wait";
            downloadBtn.style.pointerEvents = "none"; // Button disable karein
            
            fetch(`${CONFIG.BACKEND_URL}/execute-paypal/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId, PayerID: payerId, token: token })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Payment Verify ho gayi! Ab download enable karein
                    downloadBtn.innerHTML = "📥 Download Worksheets Now";
                    downloadBtn.style.pointerEvents = "auto";
                    downloadBtn.href = `${CONFIG.BACKEND_URL}/download/${token}/`;
                } else {
                    downloadBtn.innerHTML = "Payment Verification Failed";
                    downloadBtn.style.backgroundColor = "red";
                }
            })
            .catch(err => {
                console.error("Error:", err);
                downloadBtn.innerHTML = "Network Error";
                downloadBtn.style.backgroundColor = "red";
            });
        } else {
            // Stripe ke liye direct chalega
            downloadBtn.href = `${CONFIG.BACKEND_URL}/download/${token}/`;
        }
    } else {
        downloadBtn.innerHTML = "Invalid Link";
        downloadBtn.style.backgroundColor = "red";
        downloadBtn.style.pointerEvents = "none";
    }
});