import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCMwFJfbkdFjxWzNhMccXs9FbhqntSKdRM",
    authDomain: "portfolio-auth-19a5e.firebaseapp.com",
    projectId: "portfolio-auth-19a5e",
    storageBucket: "portfolio-auth-19a5e.firebasestorage.app",
    messagingSenderId: "211741915178",
    appId: "1:211741915178:web:b96f48f37ef2477b83ab53"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let isLogin = true;
const toggleBtn = document.getElementById('toggleText');

toggleBtn.onclick = () => {
    isLogin = !isLogin;
    document.getElementById('authTitle').innerText = isLogin ? "Login to RAJATECH" : "Register Account";
    document.getElementById('nameBox').style.display = isLogin ? "none" : "block";
    document.getElementById('authBtn').innerText = isLogin ? "Sign In" : "Register Now";
    toggleBtn.innerText = isLogin ? "New user? Register here" : "Member? Login now";
};

document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, pass);
            location.href = "portfolio.html";
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
            location.href = "portfolio.html";
        }
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
};
