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

// Check if User is Admin
onAuthStateChanged(auth, (user) => {
    if (user && user.email === "rajaalinagar99@gmail.com") {
        fetchUsers();
    } else {
        window.location.href = "index.html";
    }
});

async function fetchUsers() {
    const table = document.getElementById('userTable');
    table.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>Fetching data...</td></tr>";

    try {
        const querySnapshot = await getDocs(collection(db, "userProfiles"));
        table.innerHTML = "";

        if (querySnapshot.empty) {
            table.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>No users found in database.</td></tr>";
            return;
        }

        querySnapshot.forEach((document) => {
            const user = document.data();
            const row = `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding:10px;"><img src="${user.profilePic}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:1px solid var(--primary);"></td>
                    <td style="padding:10px;"><b>${user.username}</b><br><small style="color:#94a3b8">${user.email}</small></td>
                    <td style="padding:10px;">${user.aadhar}</td>
                    <td style="padding:10px;">${user.category}</td>
                    <td style="padding:10px;">
                        <button class="delete-btn" data-id="${document.id}" style="background:var(--danger); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });

        // Add Delete Event
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => deleteUserRecord(btn.getAttribute('data-id'));
        });

    } catch (error) {
        console.error("Error:", error);
        table.innerHTML = `<tr><td colspan='5' style='text-align:center; color:red;'>Error: ${error.message}</td></tr>`;
    }
}

async function deleteUserRecord(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await deleteDoc(doc(db, "userProfiles", id));
            Swal.fire('Deleted!', 'User record removed.', 'success');
            fetchUsers();
        } catch (e) {
            Swal.fire('Error', 'Delete failed!', 'error');
        }
    }
}

// Logout logic
document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => window.location.href = "index.html");
