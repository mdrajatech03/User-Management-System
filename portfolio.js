import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
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

// --- NAVIGATION LOGIC ---
window.showSection = (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';
};

// Back Button (X) logic
window.goBack = () => {
    const docRef = doc(db, "userProfiles", userUID);
    getDoc(docRef).then(snap => {
        if(snap.exists()) {
            window.showSection('viewSection'); // Agar profile hai toh ID Card dikhao
        } else {
            window.showSection('welcomeScreen'); // Warna welcome screen
        }
    }).catch(() => window.showSection('welcomeScreen'));
};

// --- AUTH OBSERVER ---
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

// --- IMAGE HANDLING ---
const fImage = document.getElementById('fImage');
if(fImage) {
    fImage.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.src = ev.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 300; canvas.height = 300;
                canvas.getContext('2d').drawImage(img, 0, 0, 300, 300);
                imgData = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('pImg').src = imgData;
            };
        };
        reader.readAsDataURL(file);
    };
}

// --- PREVIEW LOGIC (Aadhar Validation Added) ---
window.triggerPreview = () => {
    const aadhar = document.getElementById('fAadhar').value;
    const name = document.getElementById('fName').value;

    // Aadhar 12-Digit Check
    if(aadhar.toString().length !== 12) {
        return Swal.fire('Error', 'Aadhar number must be exactly 12 digits', 'error');
    }
    
    if(!name || !imgData) {
        return Swal.fire('Missing Info', 'Please provide Name and Profile Picture', 'warning');
    }

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
        profilePic: imgData
    };

    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

// --- SAVE TO DATABASE ---
window.finalSave = async () => {
    Swal.fire({title: 'Syncing...', didOpen: () => Swal.showLoading()});
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
        Swal.fire('Success', 'Profile Saved Permanently', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) {
        Swal.fire('Error', 'Could not save data. Check rules.', 'error');
    }
};

// --- UI RENDERING HELPER ---
function renderUI(d) {
    if(document.getElementById('pImg')) document.getElementById('pImg').src = d.profilePic || "";
    if(document.getElementById('pName')) document.getElementById('pName').innerText = d.username || "";
    if(document.getElementById('pEmail')) document.getElementById('pEmail').innerText = d.email || "";
    if(document.getElementById('pDob')) document.getElementById('pDob').innerText = d.dob || "-";
    if(document.getElementById('pBlood')) document.getElementById('pBlood').innerText = d.blood || "-";
    if(document.getElementById('pFather')) document.getElementById('pFather').innerText = d.father || "-";
    if(document.getElementById('pMother')) document.getElementById('pMother').innerText = d.mother || "-";
    if(document.getElementById('pCollege')) document.getElementById('pCollege').innerText = d.college || "-";
    if(document.getElementById('pCategory')) document.getElementById('pCategory').innerText = d.category || "-";
    if(document.getElementById('pAadhar')) document.getElementById('pAadhar').innerText = d.aadhar || "-";
    if(document.getElementById('pMarital')) document.getElementById('pMarital').innerText = d.marital || "-";
    if(document.getElementById('pAddress')) document.getElementById('pAddress').innerText = d.address || "-";
}

// --- LOGOUT & PDF ---
document.getElementById('logoutBtn').onclick = () => signOut(auth);

window.exportPDF = () => {
    const area = document.getElementById('printableArea');
    html2canvas(area, { scale: 3, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 15, 180, 0);
        pdf.save('RAJATECH_ID.pdf');
    });
};
        
