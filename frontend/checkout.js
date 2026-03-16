(function () {
    // ======================== CONFIG ========================
    // Replace with your actual keys / endpoints
    const RAZORPAY_KEY = 'rzp_test_YOUR_KEY';          // test key
    const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_STRIPE_KEY';
    const BACKEND_URL = 'http://127.0.0.1:8000/api';   // your backend base

    // DOM elements
    const form = document.getElementById('checkout-form');
    const payBtn = document.getElementById('main-pay-button');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const totalSpan = document.querySelector('#total-amount span:last-child');
    const paymentOptions = document.querySelectorAll('.payment-option');

    // Initialize Stripe
    const stripe = Stripe(STRIPE_PUBLIC_KEY);

    // Helper to get selected payment method
    function getSelectedMethod() {
        return document.querySelector('input[name="payment_method"]:checked')?.value;
    }

    // Update total based on selected method
    function updateTotalDisplay() {
        const method = getSelectedMethod();
        if (method === 'razorpay') {
            totalSpan.innerText = '₹299';
        } else {
            totalSpan.innerText = '$3.99';
        }
    }

    // Highlight selected payment card
    paymentOptions.forEach(opt => {
        opt.addEventListener('click', function (e) {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            paymentOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            updateTotalDisplay();
        });
    });

    // Set initial selected state
    document.querySelector('.payment-option input:checked').closest('.payment-option').classList.add('selected');
    updateTotalDisplay();

    // ================== FORM SUBMISSION ==================
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Basic validation
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        if (!name || !email || !phone) {
            alert('Please fill all fields');
            return;
        }

        const method = getSelectedMethod();
        if (!method) {
            alert('Please select a payment method');
            return;
        }

        // Disable button, show spinner
        payBtn.disabled = true;
        payBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;

        try {
            if (method === 'razorpay') {
                await handleRazorpay({ name, email, phone });
            } else if (method === 'stripe') {
                await handleStripe({ name, email, phone });
            } else if (method === 'paypal') {
                await handlePayPal({ name, email, phone });
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment initiation failed. Please try again.');
            resetButton();
        }
    });

    // ================== RAZORPAY ==================
    async function handleRazorpay(userData) {
        // 1. Create order on backend
        const response = await fetch(`${BACKEND_URL}/create-order/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Razorpay order creation failed');
        }

        // 2. Open Razorpay checkout
        const options = {
            key: RAZORPAY_KEY,
            amount: 29900,        // ₹299 in paise
            currency: 'INR',
            name: 'Kids Workbook',
            description: 'Ultimate Kids Workbook',
            order_id: data.order_id,   // from backend
            prefill: {
                name: userData.name,
                email: userData.email,
                contact: userData.phone
            },
            handler: function (response) {
                // Payment successful
                alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
                window.location.href = 'thank-you.html';
            },
            modal: {
                ondismiss: function () {
                    resetButton();
                }
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    }

    // ================== STRIPE ==================
    async function handleStripe(userData) {
        const response = await fetch(`${BACKEND_URL}/create-stripe-checkout/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const session = await response.json();

        if (session.error) {
            throw new Error(session.error);
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) {
            throw new Error(result.error.message);
        }
    }

    // ================== PAYPAL ==================
    async function handlePayPal(userData) {
        // For PayPal, we can either redirect to a backend PayPal payment page
        // or use the PayPal JS SDK to create an order and redirect.
        // Here we'll use the SDK approach.

        // First, we need to load PayPal SDK with your client ID (already loaded in head)
        // But we need to dynamically create a PayPal button or directly call `paypal.Buttons`

        // A simple approach: create a hidden container, render button, then simulate click.
        // However, to keep flow consistent, we can create a backend order and redirect.

        // We'll assume you have a backend endpoint that creates a PayPal order and returns approval URL.
        // For demonstration, we'll show a fallback.

        // Option 1: Redirect via backend
        /*
        const response = await fetch(`${BACKEND_URL}/create-paypal-order/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (data.approval_url) {
            window.location.href = data.approval_url;
        } else {
            throw new Error('PayPal order creation failed');
        }
        */

        // Option 2: Use PayPal SDK inline (requires a container)
        alert('PayPal integration: Please implement your backend endpoint and replace this alert with redirect.');
        resetButton();

        // In production, you'd create a container and use `paypal.Buttons`:
        /*
        const paypalContainer = document.createElement('div');
        paypalContainer.style.display = 'none';
        document.body.appendChild(paypalContainer);
        paypal.Buttons({
            createOrder: function(data, actions) {
                return fetch(`${BACKEND_URL}/create-paypal-order/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                }).then(res => res.json()).then(order => order.id);
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(details => {
                    alert('Payment successful!');
                    window.location.href = 'thank-you.html';
                });
            },
            onError: function(err) {
                alert('PayPal error');
                resetButton();
            }
        }).render(paypalContainer).then(() => {
            // Trigger click programmatically? Not straightforward.
            // Better to use redirect method.
        });
        */
    }

    function resetButton() {
        payBtn.disabled = false;
        payBtn.innerHTML = `<i class="fas fa-lock"></i> Proceed to Secure Payment`;
    }
})();