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

// --- 1. Show/Hide Sections ---
window.showSection = async (id) => {
    ['welcomeScreen', 'formSection', 'viewSection'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';

    // Edit Mode: Purana data load karna
    if(id === 'formSection' && userUID) {
        const snap = await getDoc(doc(db, "userProfiles", userUID));
        if(snap.exists()){
            const d = snap.data();
            document.getElementById('fName').value = d.username || "";
            document.getElementById('fAadhar').value = d.aadhar || ""; // Aadhar load fix
            document.getElementById('fDob').value = d.dob || "";
            document.getElementById('fBlood').value = d.blood || "";
            document.getElementById('fFather').value = d.father || "";
            document.getElementById('fCategory').value = d.category || "Student";
            imgData = d.profilePic || ""; 
            if(imgData) document.getElementById('pImg').src = imgData;
        }
    }
};

// --- 2. Auth Check ---
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
        } else { 
            showSection('welcomeScreen'); 
        }
    } else { 
        window.location.href = "index.html"; 
    }
});

// --- 3. Photo Upload Check (1MB) ---
const fImage = document.getElementById('fImage');
if(fImage) {
    fImage.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1048576) {
            Swal.fire('Warning', 'Photo size 1MB se kam rakhein!', 'warning');
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

// --- 4. Trigger Preview ---
window.triggerPreview = () => {
    const data = {
        username: document.getElementById('fName').value,
        aadhar: document.getElementById('fAadhar').value,
        father: document.getElementById('fFather').value,
        dob: document.getElementById('fDob').value,
        blood: document.getElementById('fBlood').value,
        category: document.getElementById('fCategory').value,
        email: auth.currentUser.email,
        profilePic: imgData
    };

    if(!data.username || data.aadhar.length !== 12 || !data.father) {
        return Swal.fire('Error', 'Name, Father Name aur 12-digit Aadhar bharo!', 'error');
    }
    if(!imgData) return Swal.fire('Error', 'Photo upload karein!', 'warning');

    renderUI(data);
    showSection('viewSection');
    document.getElementById('saveBtn').style.display = "block";
};

// --- 5. Save Data (Aadhar Fix) ---
window.finalSave = async () => {
    Swal.fire({title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
        const data = {
            username: document.getElementById('pName').innerText,
            email: document.getElementById('pEmail').innerText,
            dob: document.getElementById('pDob').innerText,
            blood: document.getElementById('pBlood').innerText,
            aadhar: document.getElementById('pAadhar').innerText, // Correct ID
            father: document.getElementById('pFather').innerText,
            category: document.getElementById('pCategory').innerText,
            profilePic: document.getElementById('pImg').src,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "userProfiles", userUID), data);
        Swal.fire('Success!', 'ID Card save ho gaya.', 'success');
        document.getElementById('saveBtn').style.display = "none";
    } catch (e) { 
        Swal.fire('Error', 'Save fail! Rules check karein.', 'error'); 
    }
};

// --- 6. Render UI ---
function renderUI(d) {
    document.getElementById('pImg').src = d.profilePic || "";
    document.getElementById('pName').innerText = d.username || "User";
    document.getElementById('pEmail').innerText = d.email || "";
    document.getElementById('pDob').innerText = d.dob || "-";
    document.getElementById('pBlood').innerText = d.blood || "-";
    document.getElementById('pAadhar').innerText = d.aadhar || "-"; // ID check
    document.getElementById('pFather').innerText = d.father || "-";
    document.getElementById('pCategory').innerText = d.category || "-";
}

// --- 7. Export PDF ---

window.exportPDF = () => {
    const area = document.getElementById('printableArea');
    
    Swal.fire({
        title: 'Generating ID Card...',
        text: 'Wait a moment...',
        didOpen: () => Swal.showLoading()
    });

    // 1. html2canvas settings fix
    html2canvas(area, {
        scale: 4, // High Quality
        useCORS: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: -window.scrollY, // Page scroll fix taaki cut na ho
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
    }).then(canvas => {
        // 2. Card ka asli ratio nikalna
        const imgWidth = 243; // Standard 3.375" in points
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 3. PDF Page size ko card ke hisaab se set karna (Portrait Mode)
        const pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: [imgWidth + 20, imgHeight + 20] // Thoda extra space taaki kete nahi
        });

        const imgData = canvas.toDataURL('image/png');

        // 4. Image ko PDF ke center mein fit karna
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

        const fileName = document.getElementById('pName').innerText || "ID_Card";
        pdf.save(`${fileName}_Professional.pdf`);
        
        Swal.close();
    }).catch(err => {
        console.error(err);
        Swal.fire('Error', 'PDF generation failed!', 'error');
    });
};


// --- 8. Logout ---
document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => window.location.href = "index.html");
            
