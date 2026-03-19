document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');
    const orderId = urlParams.get('orderId');
    
    const displayOrderId = document.getElementById('display-order-id');
    if (orderId && displayOrderId) {
        displayOrderId.innerText = "#" + orderId;
    }

    const downloadBtn = document.getElementById('download-btn');
    const loadingStatus = document.getElementById('loading-status');

    if (token) {
        if (paymentId && payerId) {
         
            loadingStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying PayPal Payment... Please wait...';

            fetch(`${CONFIG.BACKEND_URL}/execute-paypal/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId, PayerID: payerId, token: token })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    loadingStatus.style.display = "none";
                    downloadBtn.style.display = "inline-flex";
                    downloadBtn.href = `${CONFIG.BACKEND_URL}/download/${token}/`;
                } else {
                    loadingStatus.innerHTML = '<i class="fas fa-times-circle"></i> Payment Verification Failed.';
                    loadingStatus.style.color = "red";
                }
            })
            .catch(err => {
                console.error("Error:", err);
                loadingStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network Error';
                loadingStatus.style.color = "red";
            });

        } else {
        
            loadingStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizing your order... Please wait...';
            
            setTimeout(() => {
                loadingStatus.style.display = "none";
                downloadBtn.style.display = "inline-flex";
                downloadBtn.href = `${CONFIG.BACKEND_URL}/download/${token}/`;
            }, 3000); 
        }
    } else {
        loadingStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid Download Link';
        loadingStatus.style.color = "red";
    }

    
    if(downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const spanText = this.querySelector('span');
            if(spanText) {
                const originalText = spanText.innerText;
                spanText.innerText = "Downloading...";
                
                setTimeout(() => {
                    spanText.innerText = originalText;
                }, 4000);
            }
        });
    }
});