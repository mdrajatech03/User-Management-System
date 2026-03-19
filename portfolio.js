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

window.showSection = async (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => document.getElementById(s).style.display = 'none');
    document.getElementById(id).style.display = 'flex';

    if(id === 'formSection' && userUID) {
        const snap = await getDoc(doc(db, "userProfiles", userUID));
        if(snap.exists()){
            const d = snap.data();
            document.getElementById('fName').value = d.username || "";
            document.getElementById('fAadhar').value = d.aadhar || "";
            document.getElementById('fDob').value = d.dob || "";
            document.getElementById('fBlood').value = d.blood || "";
            document.getElementById('fFather').value = d.father || "";
            document.getElementById('fCategory').value = d.category || "Student";
            imgData = d.profilePic || ""; 
            if(imgData) document.getElementById('pImg').src = imgData;
        }
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        if(user.email === "rajaalinagar99@gmail.com") document.getElementById('adminBtn').style.display = "block";
        const snap = await getDoc(doc(db, "userProfiles", user.uid));
        if (snap.exists()) { renderUI(snap.data()); showSection('viewSection'); document.getElementById('saveBtn').style.display = "none"; }
        else { showSection('welcomeScreen'); }
    } else { window.location.href = "index.html"; }
});

document.getElementById('fImage').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => { imgData = ev.target.result; document.getElementById('pImg').src = imgData; };
    reader.readAsDataURL(e.target.files[0]);
};

window.triggerPreview = () => {
    const name = document.getElementById('fName').value;
    const aadhar = document.getElementById('fAadhar').value;
    if(!name || aadhar.length !== 12) return Swal.fire('Error', 'Full Name & 12-digit Aadhar required!', 'error');
    if(!imgData) return Swal.fire('Error', 'Please upload a photo!', 'warning');

    const data = {
        username: name, email: auth.currentUser.email,
        dob: document.getElementById('fDob').value, blood: document.getElementById('fBlood').value,
        father: document.getElementById('fFather').value, aadhar: aadhar,
        category: document.getElementById('fCategory').value, profilePic: imgData
    };
    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

window.finalSave = async () => {
    Swal.fire({title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            blood: document.getElementById('pBlood').innerText,
            aadhar: document.getElementById('pAadhar').innerText,
            category: document.getElementById('pCategory').innerText,
            profilePic: document.getElementById('pImg').src,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Saved!', 'Your ID card is now live.', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) { Swal.fire('Error', 'Save failed. Check Rules.', 'error'); }
};

function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic || "";
    document.getElementById('pName').innerText = d.username || "";
    document.getElementById('pEmail').innerText = d.email || "";
    document.getElementById('pDob').innerText = d.dob || "-";
    document.getElementById('pBlood').innerText = d.blood || "-";
    document.getElementById('pAadhar').innerText = d.aadhar || "-";
    document.getElementById('pCategory').innerText = d.category || "-";
}

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => window.location.href = "index.html");

window.exportPDF = () => {
    html2canvas(document.getElementById('printableArea'), {scale: 3}).then(canvas => {
        const pdf = new jspdf.jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 70, 45);
        pdf.save('RAJATECH_ID.pdf');
    });
};
