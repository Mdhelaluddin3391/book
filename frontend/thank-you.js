// frontend/thank-you.js (Line 8-15)

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');          

    const downloadBtn = document.querySelector('.btn-download');

    if (token) {
        // Yahan hardcoded URL ko dynamic banaya gaya hai
        downloadBtn.href = `${CONFIG.BACKEND_URL}/download/${token}/`;
    } else {
        downloadBtn.innerHTML = "Invalid Link";
        downloadBtn.style.backgroundColor = "red";
        downloadBtn.style.pointerEvents = "none";
    }
});