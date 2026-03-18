import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;
            
            // Unregistered user check
            const docRef = doc(db, "userProfiles", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                Swal.fire({
                    title: 'System Notice',
                    text: 'Account authenticated, but profile form is incomplete. Proceed to fill details.',
                    icon: 'warning',
                    confirmButtonText: 'Fill Form',
                    confirmButtonColor: '#00f2fe',
                    background: '#1e293b',
                    color: '#fff',
                    backdrop: `rgba(0,242,254,0.1)`
                }).then(() => {
                    location.href = "portfolio.html";
                });
            } else { location.href = "portfolio.html"; }
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
            Swal.fire({
                title: 'Welcome!',
                text: 'Account created. Directing to profile setup...',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
            }).then(() => { location.href = "portfolio.html"; });
        }
    } catch (err) { Swal.fire({ title: 'Auth Error', text: err.message, icon: 'error', background: '#1e293b', color: '#fff' }); }
};
