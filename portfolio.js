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

// --- 1. Switch Sections Logic ---
window.showSection = async (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';

    // Edit mode mein purana data load karna
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

// --- 2. Auth Status Check ---
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

// --- 3. Photo Upload with 1MB Limit ---
const fImage = document.getElementById('fImage');
if(fImage) {
    fImage.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1048576) {
            Swal.fire('Warning', 'Photo size 1MB se kam honi chahiye!', 'warning');
            e.target.value = ""; 
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => { 
            imgData = ev.target.result; 
            document.getElementById('pImg').src = imgData; 
        };
        reader.readAsDataURL(file);
    };
}

// --- 4. Trigger Preview (Card par data dikhana) ---
window.triggerPreview = () => {
    const name = document.getElementById('fName').value;
    const aadhar = document.getElementById('fAadhar').value;
    const father = document.getElementById('fFather').value;

    if(!name || aadhar.length !== 12 || !father) {
        return Swal.fire('Error', 'Name, Father Name aur 12-digit Aadhar zaroori hai!', 'error');
    }
    if(!imgData) return Swal.fire('Error', 'Profile photo upload karein!', 'warning');

    const data = {
        username: name,
        email: auth.currentUser.email,
        dob: document.getElementById('fDob').value,
        blood: document.getElementById('fBlood').value,
        father: father,
        category: document.getElementById('fCategory').value,
        profilePic: imgData
    };

    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

// --- 5. Save to Firebase (Database mein bhejnat) ---
window.finalSave = async () => {
    Swal.fire({title: 'Saving Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            blood: document.getElementById('pBlood').innerText,
            aadhar: document.getElementById('pAadhar').innerText,
            father: document.getElementById('pFather').innerText, // Father field added
            category: document.getElementById('pCategory').innerText,
            profilePic: document.getElementById('pImg').src,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Success!', 'Aapka ID card save ho gaya hai.', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) { 
        console.error(e);
        Swal.fire('Error', 'Save fail ho gaya. Rules check karein.', 'error'); 
    }
};

// --- 6. Render UI Helper ---
function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic || "";
    document.getElementById('pName').innerText = d.username || "User";
    document.getElementById('pEmail').innerText = d.email || "";
    document.getElementById('pDob').innerText = d.dob || "-";
    document.getElementById('pBlood').innerText = d.blood || "-";
    document.getElementById('pAadhar').innerText = d.aadhar || "-";
    document.getElementById('pFather').innerText = d.father || "-"; // ID card update
    document.getElementById('pCategory').innerText = d.category || "-";
}

// --- 7. Professional PDF Download ---
window.exportPDF = () => {
    const area = document.getElementById('printableArea');
    Swal.fire({title: 'PDF taiyar ho raha hai...', didOpen: () => Swal.showLoading()});

    html2canvas(area, {scale: 4, useCORS: true}).then(canvas => {
        const imgWidth = 85; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const xPos = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, 20, imgWidth, imgHeight);
        pdf.save(`ID_Card_${document.getElementById('pName').innerText}.pdf`);
        Swal.close();
    });
};

// --- 8. Logout Logic ---
const lout = document.getElementById('logoutBtn');
if(lout) {
    lout.onclick = () => signOut(auth).then(() => window.location.href = "index.html");
}
