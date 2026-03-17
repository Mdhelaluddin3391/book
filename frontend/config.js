// Agar URL mein '127.0.0.1' ya 'localhost' hai, toh local backend use hoga,
// warna production (Render) ka backend use hoga.
const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

const CONFIG = {
    BACKEND_URL:"https://book-27zu.onrender.com/api"
};