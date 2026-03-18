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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        // ADMIN CHECK (rajaalinagar99@gmail.com)
        if(user.email === "rajaalinagar99@gmail.com") document.getElementById('adminBtn').style.display = "block";
        
        const snap = await getDoc(doc(db, "userProfiles", user.uid));
        if (snap.exists()) {
            renderUI(snap.data());
            showSection('viewSection');
            document.getElementById('editBtn').style.display = "inline-block";
            document.getElementById('saveBtn').style.display = "none";
        } else { showSection('welcomeScreen'); }
    } else { location.href = "index.html"; }
});

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
        };
    };
    reader.readAsDataURL(e.target.files[0]);
};

window.triggerPreview = () => {
    const data = {
        username: document.getElementById('fName').value,
        email: auth.currentUser.email,
        dob: document.getElementById('fDob').value,
        category: document.getElementById('fCategory').value,
        father: document.getElementById('fFather').value,
        mother: document.getElementById('fMother').value,
        profilePic: imgData || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    };
    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "inline-block";
};

window.finalSave = async () => {
    try {
        Swal.fire({title:'Saving Identity...', didOpen:()=>Swal.showLoading()});
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            category: document.getElementById('pCategory').innerText,
            father: document.getElementById('pFather').innerText,
            mother: document.getElementById('pMother').innerText,
            profilePic: document.getElementById('pImg').src
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Success', 'Profile Permanent Saved!', 'success');
        document.getElementById('saveBtn').style.display = "none";
        document.getElementById('editBtn').style.display = "inline-block";
    } catch (e) { Swal.fire('Error', 'Save failed', 'error'); }
};

window.showSection = (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => document.getElementById(s).style.display = 'none');
    document.getElementById(id).style.display = 'flex';
};

function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic;
    document.getElementById('pName').innerText = d.username;
    document.getElementById('pEmail').innerText = d.email;
    document.getElementById('pDob').innerText = d.dob;
    document.getElementById('pCategory').innerText = d.category;
    document.getElementById('pFather').innerText = d.father;
    document.getElementById('pMother').innerText = d.mother;
}

window.exportPDF = () => {
    html2canvas(document.getElementById('printableArea'), {scale: 2}).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 200);
        pdf.save('RAJATECH_Profile.pdf');
    });
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);
        
