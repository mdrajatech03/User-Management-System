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

// 1. AUTH LOGIC WITH SECURE POPUP
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUID = user.uid;
        if(user.email === "rajaalinagar99@gmail.com") document.getElementById('adminBtn').style.display = "block";
        
        const snap = await getDoc(doc(db, "userProfiles", user.uid));
        if (snap.exists()) {
            renderUI(snap.data());
            showSection('viewSection');
            document.getElementById('editBtn').style.display = "inline-block";
            document.getElementById('saveBtn').style.display = "none";
        } else { showSection('welcomeScreen'); }
    } else { 
        Swal.fire({
            title: 'Secured Area',
            text: 'Access requires authentication. Redirecting...',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#fff',
            backdrop: `rgba(0,242,254,0.1)`
        }).then(() => {
            location.href = "index.html";
        });
    }
});

// Photo Compression (CORS fix handled by base64)
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
    if(e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
};

window.triggerPreview = () => {
    const dName = document.getElementById('fName').value.trim();
    if(!dName) return Swal.fire('Error', 'Full Name is required', 'warning', background:'#1e293b', color:'#fff');
    if(!imgData) return Swal.fire('Error', 'Profile photo is required', 'warning', background:'#1e293b', color:'#fff');

    const data = {
        username: dName,
        email: auth.currentUser.email,
        dob: document.getElementById('fDob').value,
        category: document.getElementById('fCategory').value,
        father: document.getElementById('fFather').value,
        profilePic: imgData
    };
    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "inline-block";
};

window.finalSave = async () => {
    try {
        Swal.fire({title: 'Securing Identity...', didOpen: () => Swal.showLoading(), background:'#1e293b', color:'#fff'});
        
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            category: document.getElementById('pCategory').innerText,
            father: document.getElementById('pFather').innerText,
            profilePic: document.getElementById('pImg').src,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Success', 'Profile Permanent Saved!', 'success', background:'#1e293b', color:'#fff');
        document.getElementById('saveBtn').style.display = "none";
        document.getElementById('editBtn').style.display = "inline-block";
    } catch (e) { Swal.fire('Error', 'Firestore connection failed', 'error', background:'#1e293b', color:'#fff'); }
};

window.showSection = (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => document.getElementById(s).style.display = 'none');
    document.getElementById(id).style.display = 'flex';
};

// Fixed Content Rendering (CORS issue handled)
function renderUI(d) {
    const imgEl = document.getElementById('pImg');
    // Photo CORS setting
    imgEl.crossOrigin = "anonymous"; 
    imgEl.src = d.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    
    document.getElementById('pName').innerText = d.username || "";
    document.getElementById('pEmail').innerText = d.email || "";
    document.getElementById('pDob').innerText = d.dob || "";
    document.getElementById('pCategory').innerText = d.category || "";
    document.getElementById('pFather').innerText = d.father || "";
}

// PDF EXPORT FIX: Circle & Content fixed
window.exportPDF = () => {
    const area = document.getElementById('printableArea');
    
    Swal.fire({
        title: 'Generating ID...',
        text: 'Syncing details to digital card...',
        background: '#1e293b',
        color: '#fff',
        didOpen: () => { Swal.showLoading(); }
    });

    html2canvas(area, {
        scale: 3, // High quality render
        useCORS: true, // Crucial for PDF photo rendering
        logging: false,
        backgroundColor: "#050816" 
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('RAJATECH_Profile_ID.pdf');
        Swal.close();
    }).catch(err => {
        console.error("PDF Export Error: ", err);
        Swal.fire('Error', 'Render failed. Try refreshing.', 'error', background:'#1e293b', color:'#fff');
    });
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.href="index.html");
            
