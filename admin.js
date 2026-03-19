import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Aapka Firebase Config
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

// --- Logout Logic (Fixed for Button) ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Logout ke baad hamesha login page (index.html) par bhejna chahiye
            window.location.href = "index.html"; 
        }).catch((error) => {
            console.error("Logout Error:", error);
            alert("Logout fail ho gaya!");
        });
    });
}

// --- Auth Check & Data Load ---
onAuthStateChanged(auth, (user) => {
    if (user && user.email === "rajaalinagar99@gmail.com") {
        console.log("Admin Verified: " + user.email);
        fetchUsers();
    } else {
        // Agar admin nahi hai toh wapas bhej do
        window.location.href = "index.html";
    }
});

// --- Table Data Load Logic ---
async function fetchUsers() {
    const tableBody = document.getElementById('userTable');
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>Loading Users...</td></tr>";

    try {
        const querySnapshot = await getDocs(collection(db, "userProfiles"));
        tableBody.innerHTML = ""; // Clear loader

        if (querySnapshot.empty) {
            tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>Database khali hai!</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const row = `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding:12px;"><img src="${user.profilePic || ''}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:1px solid #00f2fe;"></td>
                    <td style="padding:12px;">${user.username || 'No Name'}</td>
                    <td style="padding:12px; font-size:12px; color:#94a3b8;">${user.email || 'No Email'}</td>
                    <td style="padding:12px;">${user.aadhar || 'No Aadhar'}</td>
                    <td style="padding:12px;">
                        <button onclick="window.deleteUser('${docSnap.id}')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; color:red;'>Data nahi dikh raha? Firebase Rules check karein.</td></tr>";
    }
}

// Global Delete Function
window.deleteUser = async (id) => {
    if (confirm("Kya aap sach mein is user ko delete karna chahte hain?")) {
        try {
            await deleteDoc(doc(db, "userProfiles", id));
            fetchUsers(); // Refresh table
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }
};
