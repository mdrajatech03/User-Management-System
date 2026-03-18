import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

let isLogin = true;

document.getElementById('toggleText').onclick = () => {
    isLogin = !isLogin;
    document.getElementById('authTitle').innerText = isLogin ? "Secure Login" : "Create Account";
    document.getElementById('nameGroup').style.display = isLogin ? "none" : "block";
    document.getElementById('authBtn').innerText = isLogin ? "Sign In" : "Register Now";
};

document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;

    try {
        if (isLogin) {
            const cred = await signInWithEmailAndPassword(auth, email, pass);
            // Check if profile exists
            const snap = await getDoc(doc(db, "userProfiles", cred.user.uid));
            if(!snap.exists()) {
                Swal.fire('Login Success', 'Please complete your profile details.', 'info').then(() => { location.href="portfolio.html"; });
            } else { location.href="portfolio.html"; }
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
            Swal.fire('Success', 'Account Created!', 'success').then(() => { location.href="portfolio.html"; });
        }
    } catch (err) { Swal.fire('Auth Error', err.message, 'error'); }
};
