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
        loadUsers();
    } else {
        location.href = "portfolio.html";
    }
});

async function loadUsers() {
    const snap = await getDocs(collection(db, "userProfiles"));
    const list = document.getElementById('userList');
    document.getElementById('userCount').innerText = snap.size;
    list.innerHTML = "";
    snap.forEach(userDoc => {
        const d = userDoc.data();
        list.innerHTML += `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <td style="padding:10px;"><img src="${d.profilePic}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;"></td>
                <td style="padding:10px;">${d.username}</td>
                <td style="padding:10px;">${d.email}</td>
                <td style="padding:10px;">${d.category}</td>
                <td style="padding:10px;"><button onclick="deleteUser('${userDoc.id}')" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button></td>
            </tr>`;
    });
}

window.deleteUser = async (id) => {
    if(confirm("Permanently delete this user record?")) {
        await deleteDoc(doc(db, "userProfiles", id));
        location.reload();
    }
};
