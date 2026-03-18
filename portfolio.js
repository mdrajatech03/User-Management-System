import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Same Firebase Config
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

window.showSection = (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';
};

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

// Photo handling logic (compressed for database)
document.getElementById('fImage').onchange = (e) => {
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
    reader.readAsDataURL(e.target.files[0]);
};

window.triggerPreview = () => {
    const name = document.getElementById('fName').value;
    if(!name) return Swal.fire('Error', 'Name is required', 'error');
    
    document.getElementById('pName').innerText = name;
    document.getElementById('pEmail').innerText = auth.currentUser.email;
    document.getElementById('pFather').innerText = document.getElementById('fFather').value;
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

window.finalSave = async () => {
    Swal.fire({title: 'Saving...', didOpen: () => Swal.showLoading()});
    const data = {
        username: document.getElementById('pName').innerText,
        email: document.getElementById('pEmail').innerText,
        father: document.getElementById('pFather').innerText,
        profilePic: document.getElementById('pImg').src
    };
    await setDoc(doc(db, "userProfiles", userUID), data);
    Swal.fire('Success', 'Profile Saved!', 'success');
    document.getElementById('saveBtn').style.display = "none";
};

function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic;
    document.getElementById('pName').innerText = d.username;
    document.getElementById('pEmail').innerText = d.email;
    document.getElementById('pFather').innerText = d.father;
}

document.getElementById('logoutBtn').onclick = () => signOut(auth);

window.exportPDF = () => {
    const area = document.getElementById('printableArea');
    html2canvas(area, { scale: 3, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 15, 180, 0);
        pdf.save('RajaTech_Profile.pdf');
    });
};
