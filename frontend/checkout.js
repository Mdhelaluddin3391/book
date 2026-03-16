(function () {
    const RAZORPAY_KEY = 'rzp_test_Aapki_Razorpay_Key'; // Yahan key daalein
    const STRIPE_PUBLIC_KEY = 'pk_test_Aapki_Stripe_Key'; // Yahan key daalein
    const BACKEND_URL = 'http://127.0.0.1:8000/api';   

    const form = document.getElementById('checkout-form');
    const payBtn = document.getElementById('main-pay-button');
    const paypalContainer = document.getElementById('paypal-button-container');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const totalSpan = document.querySelector('#total-amount span:last-child');
    const paymentOptions = document.querySelectorAll('.payment-option');

    const stripe = Stripe(STRIPE_PUBLIC_KEY);

    function getSelectedMethod() {
        return document.querySelector('input[name="payment_method"]:checked')?.value;
    }

    function updateTotalDisplay() {
        const method = getSelectedMethod();
        if (method === 'razorpay') {
            totalSpan.innerText = '₹299';
            payBtn.style.display = 'block';
            paypalContainer.style.display = 'none';
        } else if (method === 'stripe') {
            totalSpan.innerText = '$3.99';
            payBtn.style.display = 'block';
            paypalContainer.style.display = 'none';
        } else if (method === 'paypal') {
            totalSpan.innerText = '$3.99';
            payBtn.style.display = 'none'; // PayPal ka apna button aayega
            paypalContainer.style.display = 'block';
        }
    }

    paymentOptions.forEach(opt => {
        opt.addEventListener('click', function (e) {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            paymentOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            updateTotalDisplay();
        });
    });

    document.querySelector('.payment-option input:checked').closest('.payment-option').classList.add('selected');
    updateTotalDisplay();

    // ================== FORM SUBMISSION (Razorpay & Stripe) ==================
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const userData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
        };

        if (!userData.name || !userData.email || !userData.phone) {
            alert('Please fill all fields');
            return;
        }

        const method = getSelectedMethod();
        payBtn.disabled = true;
        payBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;

        try {
            if (method === 'razorpay') {
                await handleRazorpay(userData);
            } else if (method === 'stripe') {
                await handleStripe(userData);
            }
        } catch (error) {
            console.error(error);
            alert('Payment error: ' + error.message);
            resetButton();
        }
    });

    // ================== RAZORPAY ==================
    async function handleRazorpay(userData) {
        // 1. Backend par order create karein
        const res = await fetch(`${BACKEND_URL}/create-razorpay-order/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.message);

        // 2. Razorpay Pop-up kholein
        const options = {
            key: RAZORPAY_KEY,
            amount: 29900,
            currency: 'INR',
            name: 'Kids Workbook',
            order_id: data.order_id, 
            prefill: { name: userData.name, email: userData.email, contact: userData.phone },
            handler: async function (response) {
                // 3. Payment verify karein backend par
                const verifyRes = await fetch(`${BACKEND_URL}/verify-razorpay/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.status === 'success') {
                    window.location.href = `thank-you.html?token=${data.token}`; // Securely redirect
                } else {
                    alert('Payment Verification Failed!');
                    resetButton();
                }
            },
            modal: { ondismiss: function () { resetButton(); } }
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
        if (session.error) throw new Error(session.error);
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) throw new Error(result.error.message);
    }

    // ================== PAYPAL (Auto loaded) ==================
    paypal.Buttons({
        createOrder: function(data, actions) {
            if(!nameInput.value || !emailInput.value || !phoneInput.value) {
                alert("Please fill name, email and phone first.");
                return null;
            }
            return actions.order.create({
                purchase_units: [{ amount: { value: '3.99' } }]
            });
        },
        onApprove: async function(data, actions) {
            return actions.order.capture().then(async function(details) {
                // Payment ho gayi, backend ko btao
                const verifyRes = await fetch(`${BACKEND_URL}/verify-paypal/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameInput.value, email: emailInput.value, phone: phoneInput.value,
                        paypal_order_id: details.id
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.status === 'success') {
                    window.location.href = `thank-you.html?token=${verifyData.token}`;
                }
            });
        }
    }).render('#paypal-button-container');

    function resetButton() {
        payBtn.disabled = false;
        payBtn.innerHTML = `<i class="fas fa-lock"></i> Proceed to Secure Payment`;
    }
})();