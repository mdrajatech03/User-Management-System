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

// --- 1. SECTION SWITCHER (With Debugging) ---
window.showSection = async (id) => {
    console.log("Switching to section:", id); // Browser console mein check karne ke liye
    const sections = ['welcomeScreen', 'formSection', 'viewSection'];
    
    sections.forEach(s => {
        const el = document.getElementById(s);
        if(el) {
            el.style.display = 'none';
            el.style.opacity = '0';
        }
    });

    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'flex';
        setTimeout(() => { target.style.opacity = '1'; }, 50);
    }

    // Edit Profile Logic
    if(id === 'formSection' && userUID) {
        try {
            const snap = await getDoc(doc(db, "userProfiles", userUID));
            if(snap.exists()){
                const d = snap.data();
                document.getElementById('fName').value = d.username || "";
                document.getElementById('fAadhar').value = d.aadhar || "";
                document.getElementById('fDob').value = d.dob || "";
                document.getElementById('fBlood').value = d.blood || "";
                document.getElementById('fFather').value = d.father || "";
                document.getElementById('fMother').value = d.mother || "";
                document.getElementById('fCollege').value = d.college || "";
                document.getElementById('fCategory').value = d.category || "Student";
                document.getElementById('fAddress').value = d.address || "";
                document.getElementById('fMarital').value = d.marital || "Single";
                imgData = d.profilePic || "";
            }
        } catch(e) { console.error("Auto-fill error:", e); }
    }
};

// --- 2. AUTH OBSERVER (Fixed Login Flow) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        console.log("User Logged In:", user.email);

        // Admin Button
        if(user.email === "rajaalinagar99@gmail.com") {
            const adminBtn = document.getElementById('adminBtn');
            if(adminBtn) adminBtn.style.display = "block";
        }

        try {
            const snap = await getDoc(doc(db, "userProfiles", user.uid));
            if (snap.exists()) {
                console.log("Profile Found, Rendering...");
                renderUI(snap.data());
                window.showSection('viewSection');
            } else {
                console.log("No Profile, Showing Welcome...");
                window.showSection('welcomeScreen');
            }
        } catch (error) {
            console.error("Firestore Error:", error);
            window.showSection('welcomeScreen');
        }
    } else {
        window.location.href = "index.html";
    }
});

// --- 3. UI RENDERING ---
function renderUI(d) {
    const elements = {
        'pImg': 'src', 'pName': 'innerText', 'pEmail': 'innerText',
        'pDob': 'innerText', 'pBlood': 'innerText', 'pFather': 'innerText',
        'pMother': 'innerText', 'pCollege': 'innerText', 'pCategory': 'innerText',
        'pAadhar': 'innerText', 'pMarital': 'innerText', 'pAddress': 'innerText'
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) {
            if (elements[id] === 'src') el.src = d.profilePic || "";
            else el.innerText = d[id.replace('p', '').toLowerCase()] || d[id] || "-";
        }
    }
    // Special mapping for field names that don't match exactly
    if(document.getElementById('pName')) document.getElementById('pName').innerText = d.username || "";
}

// --- 4. BUTTON ACTIONS ---
window.goBack = () => window.showSection('viewSection');

window.triggerPreview = () => {
    const aadhar = document.getElementById('fAadhar').value;
    const name = document.getElementById('fName').value;

    if(aadhar.toString().length !== 12) {
        return Swal.fire('Error', 'Aadhar number must be 12 digits', 'error');
    }
    if(!name) return Swal.fire('Missing Name', 'Please enter name', 'warning');

    const data = {
        username: name,
        email: auth.currentUser.email,
        dob: document.getElementById('fDob').value,
        blood: document.getElementById('fBlood').value,
        father: document.getElementById('fFather').value,
        mother: document.getElementById('fMother').value,
        college: document.getElementById('fCollege').value,
        category: document.getElementById('fCategory').value,
        aadhar: aadhar,
        marital: document.getElementById('fMarital').value,
        address: document.getElementById('fAddress').value,
        profilePic: imgData || document.getElementById('pImg').src
    };

    renderUI(data);
    window.showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

window.finalSave = async () => {
    Swal.fire({title: 'Saving...', didOpen: () => Swal.showLoading()});
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
        profilePic: document.getElementById('pImg').src
    };
    await setDoc(doc(db, "userProfiles", userUID), data);
    Swal.fire('Success', 'Profile Updated!', 'success');
    document.getElementById('saveBtn').style.display = "none";
};

// Image, Logout, PDF logic (Same as before)
const fImage = document.getElementById('fImage');
if(fImage) {
    fImage.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { imgData = ev.target.result; document.getElementById('pImg').src = imgData; };
        reader.readAsDataURL(e.target.files[0]);
    };
}
document.getElementById('logoutBtn').onclick = () => signOut(auth);
window.exportPDF = () => { /* PDF Logic */ };
                                          
