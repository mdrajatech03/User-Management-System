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
    if (user && user.email === "rajaalinagar99@gmail.com") {
        const snap = await getDocs(collection(db, "userProfiles"));
        const list = document.getElementById('userList');
        document.getElementById('userCount').innerText = snap.size;
        list.innerHTML = "";
        snap.forEach(userDoc => {
            const d = userDoc.data();
            list.innerHTML += `<tr>
                <td><img src="${d.profilePic}" class="row-img"></td>
                <td>${d.username}</td><td>${d.email}</td><td>${d.category}</td>
                <td><button onclick="deleteUser('${userDoc.id}')" class="btn-logout" style="padding:5px;">Delete</button></td>
            </tr>`;
        });
    } else { location.href = "portfolio.html"; }
});

window.deleteUser = async (id) => {
    Swal.fire({
        title: 'Delete user?',
        text: 'This action is permanent.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#1e293b',
        confirmButtonText: 'Yes, Delete',
        background: '#1e293b',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "userProfiles", id));
            location.reload();
        }
    });
};
