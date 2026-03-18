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

window.showSection = (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    document.getElementById(id).style.display = 'flex';
};

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

// Photo Handling
document.getElementById('fImage').onchange = (e) => {
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

window.triggerPreview = () => {
    const aadhar = document.getElementById('fAadhar').value;
    const name = document.getElementById('fName').value;

    // Aadhar Validation (Exactly 12 digits)
    if(aadhar.length !== 12) {
        return Swal.fire('Invalid Aadhar', 'Please enter a valid 12-digit Aadhar number.', 'error');
    }
    if(!name || !imgData) {
        return Swal.fire('Missing Data', 'Name and Profile Picture are required.', 'warning');
    }

    const data = {
        username: name,
        userTag: document.getElementById('fUser').value,
        email: auth.currentUser.email,
        dob: document.getElementById('fDob').value,
        blood: document.getElementById('fBlood').value,
        father: document.getElementById('fFather').value,
        mother: document.getElementById('fMother').value,
        college: document.getElementById('fCollege').value,
        marital: document.getElementById('fMarital').value,
        category: document.getElementById('fCategory').value,
        aadhar: aadhar,
        address: document.getElementById('fAddress').value,
        profilePic: imgData
    };

    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

window.finalSave = async () => {
    Swal.fire({title: 'Securing Profile...', didOpen: () => Swal.showLoading()});
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
        Swal.fire('Identity Verified', 'Your profile is now live.', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) {
        Swal.fire('Database Error', 'Could not save profile.', 'error');
    }
};

function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic || "";
    document.getElementById('pName').innerText = d.username || "Full Name";
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

document.getElementById('logoutBtn').onclick = () => {
    signOut(auth).then(() => location.href = "index.html");
};

window.exportPDF = () => {
    const area = document.getElementById('printableArea');
    Swal.fire({title: 'Generating PDF...', didOpen: () => Swal.showLoading()});
    
    html2canvas(area, { scale: 3, useCORS: true, backgroundColor: "#0f172a" }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 15, 20, 180, 0);
        pdf.save(`${document.getElementById('pName').innerText}_ID_Card.pdf`);
        Swal.close();
    });
};
