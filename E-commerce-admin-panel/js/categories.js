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
const productsBody=document.getElementById("productsBody");
const addBtn=document.querySelector(".add-btn");
const deleteModal =document.getElementById("deleteModal");
const categoryBody=document.getElementById("categoryBody");

const cancelBtn =document.getElementById("cancelBtn");

const confirmDeleteBtn =document.getElementById("confirmDeleteBtn");
let selectedCategoryId = null;

const addCategoriesBtn=document.querySelector(".add-categories");

addCategoriesBtn.addEventListener("click",()=>{
    window.location.href="add-categories.html"
})

document.addEventListener("DOMContentLoaded", async() => {
    const user = localStorage.getItem("user");
   

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadCategories();
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


async function loadCategories() {
    const querySnapshot = await getDocs(collection(db, "categories"));

    categoryBody.innerHTML = "";
    let index = 1;

    querySnapshot.forEach((docSnap) => {
        const category = docSnap.data();
        const categoryId = docSnap.id;

        categoryBody.innerHTML += `
            <tr>
                <td>${index}</td>

                <td>${category.name}</td>

                <td>
                    <div style="display:flex; align-items:center; gap:10px;  justify-content: center;">
                        <span
                            style="
                                width:18px;
                                height:18px;
                                border-radius:50%;
                                background:${category.color};
                                display:inline-block;
                                border:1px solid #ddd;">
                        </span>

                        ${category.color}
                    </div>
                </td>

                <td>
                    <button class="edit-btn" data-id="${categoryId}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="delete-btn" data-id="${categoryId}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

        index++;
    });
}

document.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        selectedCategoryId =e.target.dataset.id;
        deleteModal.classList.add("show");
      }
});
    
cancelBtn.addEventListener("click", () => {
      deleteModal.classList.remove("show");
});
    
confirmDeleteBtn.addEventListener(
      "click",
      async () => {
        await deleteDoc(
          doc(db, "categories",  selectedCategoryId)
        );
        deleteModal.classList.remove("show");
        loadCategories();
        
      }
);
    
document.addEventListener("click", (e) => {
      const btn = e.target.closest(".edit-btn");
    
      if (btn) {
        const id = btn.dataset.id;
        window.location.href = `edit-category.html?id=${id}`;
      }
});
