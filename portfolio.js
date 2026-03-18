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

// --- NAVIGATION & EDIT AUTO-FILL ---
window.showSection = async (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });

    // Edit Profile Logic: Form khulne par purana data bharega
    if(id === 'formSection' && userUID) {
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
            imgData = d.profilePic || ""; // Purani photo store rakho
        }
    }
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';
};

// Close (X) Button Logic
window.goBack = () => {
    getDoc(doc(db, "userProfiles", userUID)).then(snap => {
        if(snap.exists()) window.showSection('viewSection');
        else window.showSection('welcomeScreen');
    }).catch(() => window.showSection('welcomeScreen'));
};

// --- AUTH OBSERVER ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        if(user.email === "rajaalinagar99@gmail.com") {
            const adminBtn = document.getElementById('adminBtn');
            if(adminBtn) adminBtn.style.display = "block";
        }
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

// --- GENERATE ID (PREVIEW) LOGIC ---
window.triggerPreview = () => {
    const aadhar = document.getElementById('fAadhar').value;
    const name = document.getElementById('fName').value;

    if(aadhar.toString().length !== 12) {
        return Swal.fire('Error', 'Aadhar number must be 12 digits', 'error');
    }
    
    if(!name) {
        return Swal.fire('Missing Name', 'Please enter your full name', 'warning');
    }

    // Nayi photo ya purani photo check
    const currentPhoto = imgData || document.getElementById('pImg').src;

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
        profilePic: currentPhoto
    };

    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Preview Generated!',
        showConfirmButton: false,
        timer: 1500
    });
};

// --- FINAL SAVE ---
window.finalSave = async () => {
    Swal.fire({title: 'Saving Data...', didOpen: () => Swal.showLoading()});
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
        Swal.fire('Success', 'Profile Updated Successfully!', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) {
        Swal.fire('Error', 'Database Sync Failed!', 'error');
    }
};

function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic || "";
    document.getElementById('pName').innerText = d.username || "";
    document.getElementById('pEmail').innerText = d.email || "";
    document.getElementById('pDob').innerText = d.dob || "-";
    document.getElementById('pBlood').innerText = d.blood || "-";
    document.getElementById('pFather').innerText = d.father || "-";
    document.getElementById('pMother').innerText = d.mother || "-";
    document.getElementById('pCollege').innerText = d.college || "-";
    document.getElementById('pCategory').innerText = d.category || "-";
    document.getElementById('pAadhar').innerText = d.aadhar || "-";
    document.getElementById('pMarital').innerText = d.marital || "-";
    document.getElementById('pAddress').innerText = d.address || "-";
}

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
