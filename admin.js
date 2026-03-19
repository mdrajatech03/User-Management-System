import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- 1. Security & Data Load ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email === "rajaalinagar99@gmail.com") {
            console.log("Admin logged in: " + user.email);
            fetchUsers();
        } else {
            Swal.fire('Access Denied', 'Sirf Admin hi ye page dekh sakta hai.', 'error')
                .then(() => window.location.href = "portfolio.html");
        }
    } else {
        window.location.href = "index.html";
    }
});

// --- 2. Fetch Users Logic ---
async function fetchUsers() {
    const tableBody = document.getElementById('userTable');
    tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>Data load ho raha hai...</td></tr>";

    try {
        const querySnapshot = await getDocs(collection(db, "userProfiles"));
        tableBody.innerHTML = ""; // Clear loading message

        if (querySnapshot.empty) {
            tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>Database mein koi user nahi mila.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const row = `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding:12px;"><img src="${user.profilePic || ''}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:1px solid var(--primary);"></td>
                    <td style="padding:12px;"><b>${user.username || 'N/A'}</b></td>
                    <td style="padding:12px; font-size:12px;">${user.email || 'N/A'}</td>
                    <td style="padding:12px;">${user.aadhar || 'N/A'}</td>
                    <td style="padding:12px;">
                        <button onclick="deleteUserRecord('${docSnap.id}')" style="background:var(--danger); color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px;">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        tableBody.innerHTML = `<tr><td colspan='5' style='text-align:center; color:red; padding:20px;'>Error: Permission Denied ya Rules Check Karein.</td></tr>`;
    }
}

// --- 3. Delete Function ---
window.deleteUserRecord = async (id) => {
    const confirm = await Swal.fire({
        title: 'Delete karein?',
        text: "User ka sara data delete ho jayega!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Haan, Delete kardo!'
    });

    if (confirm.isConfirmed) {
        try {
            await deleteDoc(doc(db, "userProfiles", id));
            Swal.fire('Deleted!', 'User record nikal diya gaya.', 'success');
            fetchUsers(); // Table refresh karein
        } catch (e) {
            Swal.fire('Error', 'Delete fail ho gaya!', 'error');
        }
    }
};

// --- 4. Fixed Logout Logic ---
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        Swal.fire('Error', 'Logout nahi ho paya!', 'error');
    });
});
