import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

onAuthStateChanged(auth, async (user) => {
    // Sirf aapka email hi admin access kar sakega
    if (user && user.email === "rajaalinagar99@gmail.com") {
        loadUsers();
    } else {
        Swal.fire('Access Denied', 'Only Admin can view this page.', 'error').then(() => {
            location.href = "portfolio.html";
        });
    }
});

async function loadUsers() {
    const list = document.getElementById('userList');
    const count = document.getElementById('userCount');
    
    try {
        const snap = await getDocs(collection(db, "userProfiles"));
        list.innerHTML = "";
        count.innerText = snap.size;

        snap.forEach(userDoc => {
            const d = userDoc.data();
            list.innerHTML += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px;">
                        <img src="${d.profilePic || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border: 1px solid #00f2fe;">
                    </td>
                    <td style="padding: 10px;">
                        <div style="font-weight:bold;">${d.username}</div>
                        <div style="font-size:10px; color:#aaa;">ID: ${userDoc.id.substring(0,8)}</div>
                    </td>
                    <td style="padding: 10px;">
                        <div style="font-size:12px;">${d.email}</div>
                        <div style="font-size:11px; color:#00f2fe;">Aadhar: ${d.aadhar || 'N/A'}</div>
                    </td>
                    <td style="padding: 10px; font-size:12px;">
                        ${d.category}<br><small>${d.college || ''}</small>
                    </td>
                    <td style="padding: 10px; font-size:12px;">
                        <span style="color:#ef4444; font-weight:bold;">${d.blood || '-'}</span><br>${d.dob || '-'}
                    </td>
                    <td style="padding: 10px; font-size:10px; max-width:150px; overflow:hidden;">
                        ${d.address || '-'}
                    </td>
                    <td style="padding: 10px;">
                        <button onclick="window.deleteUser('${userDoc.id}')" style="background:#ef4444; border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:11px;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading users:", err);
    }
}

// Global function to delete user
window.deleteUser = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This user's profile will be permanently removed!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, Delete it!'
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "userProfiles", id));
            Swal.fire('Deleted!', 'User record has been removed.', 'success');
            loadUsers(); // Refresh table
        } catch (e) {
            Swal.fire('Error', 'Could not delete user.', 'error');
        }
    }
};
