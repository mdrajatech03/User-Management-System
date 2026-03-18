import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let userUID = "";
let imgData = "";

// --- 1. FIXED SECTION SWITCHER (With Debugging) ---
window.showSection = async (id) => {
    const sections = ['welcomeScreen', 'formSection', 'viewSection'];
    
    // Sabko hide karo
    sections.forEach(s => {
        const el = document.getElementById(s);
        if(el) {
            el.style.setProperty('display', 'none', 'important');
        }
    });

    // Jo chahiye sirf use dikhao
    const target = document.getElementById(id);
    if(target) {
        target.style.setProperty('display', 'flex', 'important');
        console.log("Section visible now:", id);
    }
};


// --- 2. AUTH OBSERVER (Same as before) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        // Admin Access Check
        if(user.email === "rajaalinagar99@gmail.com") {
            const adminBtn = document.getElementById('adminBtn');
            if(adminBtn) adminBtn.style.display = "block";
        }
        
        // Auto-load Profile
        const snap = await getDoc(doc(db, "userProfiles", user.uid));
        if (snap.exists()) {
            renderUI(snap.data());
            showSection('viewSection');
            document.getElementById('saveBtn').style.display = "none";
        } else {
            showSection('welcomeScreen');
        }
    } else {
        window.location.href = "index.html";
    }
});

// --- 3. GENERATE ID (PREVIEW) LOGIC WITH LOADING ANIMATION ---
window.triggerPreview = () => {
    // Regular Expressions for Validation
    const aadharRegex = /^\d{12}$/; // Exactly 12 digits
    const nameRegex = /^[a-zA-Z\s]+$/; // Letters and spaces only

    const aadhar = document.getElementById('fAadhar').value;
    const name = document.getElementById('fName').value;
    const email = auth.currentUser.email;

    // 1. Basic Field Checks
    if(!name || !imgData) {
        return Swal.fire('Missing Info', 'Please provide Full Name and select a Profile Picture.', 'warning');
    }

    // 2. Data Validation
    if(!nameRegex.test(name)) {
        return Swal.fire('Invalid Name', 'Name should only contain letters and spaces.', 'error');
    }

    if(!aadharRegex.test(aadhar)) {
        return Swal.fire('Invalid Aadhar', 'Aadhar number must be exactly 12 digits.', 'error');
    }

    // --- 3. SHOW LOADING ANIMATION ---
    Swal.fire({
        title: 'Verifying Details...',
        text: 'Generating Digital ID Card...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Simulate backend processing (0.8s ka delay feel ke liye)
    setTimeout(() => {
        // All checks passed, close loading and show preview
        const data = {
            username: name,
            email: email,
            dob: document.getElementById('fDob').value,
            blood: document.getElementById('fBlood').value,
            father: document.getElementById('fFather').value,
            mother: document.getElementById('fMother').value,
            college: document.getElementById('fCollege').value,
            category: document.getElementById('fCategory').value,
            aadhar: aadhar,
            marital: document.getElementById('fMarital').value,
            address: document.getElementById('fAddress').value,
            profilePic: imgData
        };

        renderUI(data);
        showSection('viewSection');
        document.getElementById('saveBtn').style.display = "block";

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Preview Generated Successfully',
            showConfirmButton: false,
            timer: 1500
        });
    }, 800); 
};

// --- 4. FINAL SAVE ---
window.finalSave = async () => {
    Swal.fire({title: 'Syncing with Server...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            blood: document.getElementById('pBlood').innerText,
            father: document.getElementById('pFather').innerText,
            mother: document.getElementById('pMother').innerText,
            college: document.getElementById('pCollege').innerText,
            category: document.getElementById('pCategory').innerText,
            aadhar: document.getElementById('pAadhar').innerText,
            marital: document.getElementById('pMarital').innerText,
            address: document.getElementById('pAddress').innerText,
            profilePic: document.getElementById('pImg').src,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Success', 'Profile Secured and Updated!', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) {
        console.error("Save Error:", e);
        Swal.fire('Error', 'Failed to synchronize with database. Try refreshing.', 'error');
    }
};

// ... (renderUI, image handling, logout, pdf logic remains same as before) ...
            
