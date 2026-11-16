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
    updateDoc,
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

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("id");
const leftIcon=document.querySelector(".fa-circle-left");

const form = document.getElementById("updateProductForm");
const categoryName = document.getElementById("categoryName");
const categoryColor = document.getElementById("categoryColor");
const colorValue = document.getElementById("colorValue");

const toastSucces = document.getElementById("toastSucces");
const toastError = document.getElementById("toastError");
const addCategoriesBtn=document.querySelector(".categoryBtn");
let isSubmitting = false;
const loader = document.querySelector(".loader");


leftIcon.addEventListener("click",()=>{
  window.location.href="categories.html";
  
})

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadCategory();
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

async function loadCategory() {
 const docSnap = await getDoc(
  doc(db, "categories", categoryId)
);

  if (!docSnap.exists()) return;

  const category = docSnap.data();
  categoryName.value = category.name;
    categoryColor.value = category.color;
    colorValue.textContent = category.color;

}

categoryColor.addEventListener("input", () => {
    colorValue.textContent = categoryColor.value;
});


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!categoryName.value.trim()) {
        toastError.textContent = "Please enter a category name.";
        toastError.classList.add("show");

        setTimeout(() => {
            toastError.classList.remove("show");
        }, 2000);

        return;
    }

    const category = {
        name: categoryName.value.trim(),
        color: categoryColor.value,
    };
     isSubmitting = true;
    addCategoriesBtn.disabled = true;
    loader.classList.add("show");
    try {
        await updateDoc(
            doc(db, "categories", categoryId),
            category
        );
        loader.classList.remove("show");
        addCategoriesBtn.disabled = false;

        toastSucces.textContent = "Category updated successfully.";
        toastSucces.classList.add("show");

        setTimeout(() => {
            window.location.href = "categories.html";
        }, 2000);

    } catch (error) {
        console.log(error);
        isSubmitting = false;
        addCategoriesBtn.disabled = false;
        loader.classList.remove("show");
        toastError.textContent = "Category could not be updated.";
        toastError.classList.add("show");

        setTimeout(() => {
            toastError.classList.remove("show");
        }, 2000);
    }
});
