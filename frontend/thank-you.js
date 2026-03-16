document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');          

    const downloadBtn = document.querySelector('.btn-download');

    if (token) {
        // Mock payment se direct token aayega
        downloadBtn.href = `http://127.0.0.1:8000/api/download/${token}/`;
    } else {
        downloadBtn.innerHTML = "Invalid Link";
        downloadBtn.style.backgroundColor = "red";
        downloadBtn.style.pointerEvents = "none";
    }
});