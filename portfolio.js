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

// --- Section Navigation ---
window.showSection = (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.setProperty('display', 'none', 'important');
    });
    const target = document.getElementById(id);
    if(target) target.style.setProperty('display', 'flex', 'important');
};

window.goBack = () => {
    getDoc(doc(db, "userProfiles", userUID)).then(snap => {
        if(snap.exists()) showSection('viewSection');
        else showSection('welcomeScreen');
    });
};

// --- Auth State ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        if(user.email === "rajaalinagar99@gmail.com") document.getElementById('adminBtn').style.display = "block";
        
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

// --- Image Upload ---
document.getElementById('fImage').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        imgData = ev.target.result;
        document.getElementById('pImg').src = imgData;
    };
    reader.readAsDataURL(e.target.files[0]);
};

// --- Generate Preview ---
window.triggerPreview = () => {
    const aadhar = document.getElementById('fAadhar').value;
    const name = document.getElementById('fName').value;

    if(aadhar.toString().length !== 12) return Swal.fire('Error', 'Aadhar must be 12 digits', 'error');
    if(!name || !imgData) return Swal.fire('Required', 'Name and Photo are missing', 'warning');

    Swal.fire({title: 'Generating ID...', didOpen: () => Swal.showLoading()});

    setTimeout(() => {
        const data = {
            username: name,
            email: auth.currentUser.email,
            dob: document.getElementById('fDob').value,
            blood: document.getElementById('fBlood').value,
            father: document.getElementById('fFather').value,
            aadhar: aadhar,
            address: document.getElementById('fAddress').value,
            profilePic: imgData
        };
        renderUI(data);
        showSection('viewSection');
        document.getElementById('saveBtn').style.display = "block";
        Swal.close();
    }, 800);
};

// --- Save Data ---
window.finalSave = async () => {
    Swal.fire({title: 'Saving...', didOpen: () => Swal.showLoading()});
    try {
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            blood: document.getElementById('pBlood').innerText,
            father: document.getElementById('pFather').innerText,
            aadhar: document.getElementById('pAadhar').innerText,
            address: document.getElementById('pAddress').innerText,
            profilePic: document.getElementById('pImg').src,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Success', 'Profile Saved!', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) { Swal.fire('Error', 'Failed to save', 'error'); }
};

function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic || "";
    document.getElementById('pName').innerText = d.username || "";
    document.getElementById('pEmail').innerText = d.email || "";
    document.getElementById('pDob').innerText = d.dob || "-";
    document.getElementById('pBlood').innerText = d.blood || "-";
    document.getElementById('pFather').innerText = d.father || "-";
    document.getElementById('pAadhar').innerText = d.aadhar || "-";
}

// --- FIXED LOGOUT ---
document.getElementById('logoutBtn').onclick = () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
};

window.exportPDF = () => {
    html2canvas(document.getElementById('printableArea'), {scale:3}).then(canvas => {
        const pdf = new jspdf.jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 15, 180, 0);
        pdf.save('ID_Card.pdf');
    });
};
