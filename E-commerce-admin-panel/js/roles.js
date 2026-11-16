import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    collection,
    setDoc,
    addDoc,
    serverTimestamp,
     writeBatch
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAphbaNQ9s1CIzuQxvyBJzuPE_Jbx97ThU",
    authDomain: "e-commerce-2da2e.firebaseapp.com",
    projectId: "e-commerce-2da2e",
    storageBucket: "e-commerce-2da2e.firebasestorage.app",
    messagingSenderId: "84955754034",
    appId: "1:84955754034:web:deb1c90d38d156b9f2162b"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userName=document.getElementById("userName");
const logoutBtn=document.getElementById("logoutBtn");
const userNameFirst=document.getElementById("userNameFirst");

const toastSuccess = document.getElementById("toastSuccess");
const toastError=document.getElementById("toastError");

const title=document.getElementById("title");
const explanation=document.getElementById("description");
const keyword=document.getElementById("keyword");

const rolesAddButton =document.querySelector(".rolesAddButton ");
const rolesLoader=document.querySelector(".rolesSaveButton .loader")
const rolesSaveButton=document.querySelector(".rolesSaveButton");
const saveLoader=document.querySelector(".rolesSaveButton .loader")

const rolesItems = document.querySelector(".roles-items");
const roleModal = document.getElementById("roleModal");
const roleName = document.getElementById("roleName");

const saveRole = document.getElementById("saveRole");
const cancelRole = document.getElementById("cancelRole");
const editModal = document.getElementById("editModal");
const editName = document.getElementById("editName");

const cancelEdit = document.getElementById("cancelEdit");
const saveEdit = document.getElementById("saveEdit");

const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
const editLoader = document.querySelector("#saveEdit .loader");
const deleteLoader = document.querySelector("#confirmDelete .loader");
let currentDeleteItem = null;

let currentEditItem = null;

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadRoles();
    
});

function loadUser() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        const docSnap = await getDoc(doc(db, "users", user.uid));

        if (docSnap.exists()) {
            const data = docSnap.data();
            userName.textContent = `${data.name} ${data.surname}`;
            userNameFirst.textContent=data.name.charAt(0).toUpperCase();
        }
    });
}
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.href = "login.html";
});


function showToast(message, type) {

    const toast = type === "success"
        ? toastSuccess
        : toastError;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    },3000);
}
rolesAddButton.addEventListener("click", () => {
    roleModal.classList.add("show");
    roleName.value = "";
    roleName.focus();
});

cancelRole.addEventListener("click", () => {
    roleModal.classList.remove("show");
});
cancelDelete.addEventListener("click", () => {
    deleteModal.classList.remove("show");
});
confirmDelete.addEventListener("click", async () => {

    confirmDelete.disabled = true;
    cancelDelete.disabled = true;

    deleteLoader.classList.add("show");

    if (currentDeleteItem) {
        currentDeleteItem.remove();
    }

    deleteLoader.classList.remove("show");

    confirmDelete.disabled = false;
    cancelDelete.disabled = false;

    deleteModal.classList.remove("show");

    showToast("Role deleted successfully.", "success");

});

saveRole.addEventListener("click", () => {

    const name = roleName.value.trim();

    if(name === ""){
      showToast("Please enter a role name.", "error");
        return;
    }

    const item = document.createElement("div");
    item.className = "role-item";

   item.innerHTML = `
    <span>${name}</span>

    <div>
        <button class="edit-role">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-role">
            <i class="fa-solid fa-minus"></i>
        </button>
    </div>
`;
     rolesItems.appendChild(item);
     showToast("Role added successfully.", "success");

    roleName.value = "";
    roleModal.classList.remove("show");
});

cancelEdit.addEventListener("click", () => {

    editModal.classList.remove("show");

});

saveEdit.addEventListener("click", async() => {

    const value = editName.value.trim();

    if (value === "") {
        showToast("Please enter a role name.", "error");
        return;
    }
    saveEdit.disabled = true;
    cancelEdit.disabled = true;

    editLoader.classList.add("show");

    currentEditItem.querySelector("span").textContent = value;

    editModal.classList.remove("show");

    showToast("Role updated successfully.", "success");

    editLoader.classList.remove("show");

    saveEdit.disabled = false;
    cancelEdit.disabled = false;

});

rolesItems.addEventListener("click",(e)=>{

      if (e.target.closest(".delete-role")) {

    currentDeleteItem = e.target.closest(".role-item");

    deleteModal.classList.add("show");

}

      if (e.target.closest(".edit-role")) {

        currentEditItem = e.target.closest(".role-item");

        const text =currentEditItem.querySelector("span").textContent;

        editName.value = text;

        editModal.classList.add("show");

        editName.focus();
    }
});

rolesSaveButton.addEventListener("click", async () => {
    const roleElements = document.querySelectorAll(".role-item span");

    if (roleElements.length === 0) {
        showToast("Please add at least one role.", "error");
        return;
    }

    rolesSaveButton.disabled = true;
    rolesLoader.classList.add("show");

    try {

        const batch = writeBatch(db);
        const snapshot = await getDocs(collection(db, "roles"));
        snapshot.forEach(docSnap => {
            batch.delete(docSnap.ref);
        });

        roleElements.forEach(role => {

            const ref = doc(collection(db, "roles"));

            batch.set(ref, {
                name: role.textContent,
                createdAt: serverTimestamp()
            });

        });

        await batch.commit();

        showToast("Roles saved successfully.", "success");

    } catch (error) {

        console.log(error);
        showToast("An error occurred while saving.", "error");

    } finally {

        rolesLoader.classList.remove("show");
        rolesSaveButton.disabled = false;
    }
});

async function loadRoles() {

    rolesItems.innerHTML = "";

    const snapshot = await getDocs(collection(db, "roles"));

    snapshot.forEach(doc => {

        const item = document.createElement("div");

        item.className = "role-item";

        item.innerHTML = `
            <span>${doc.data().name}</span>
            <div>
        <button class="edit-role">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-role">
            <i class="fa-solid fa-minus"></i>
        </button>
    </div>
        `;

        rolesItems.appendChild(item);

    });

}