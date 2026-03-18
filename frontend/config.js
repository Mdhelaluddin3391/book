const isLocalhost =
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost';

const CONFIG = {
    BACKEND_URL: isLocalhost
        ? "http://127.0.0.1:8000/api"
        : "https://book-1-6ixc.onrender.com/api"
};