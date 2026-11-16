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
    addDoc,
    getDoc,
    collection
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

const toastSucces = document.getElementById("toastSucces");
const toastError=document.getElementById("toastError");

const leftIcon=document.querySelector(".fa-circle-left");

const categoryName=document.getElementById("categoryName");
const categoryColor=document.getElementById("categoryColor");
const color=document.getElementById("colorValue");
const categoryBtn=document.querySelector(".categoryBtn");

const addCategoryForm = document.querySelector("#addCategoryForm");
let isSubmitting = false;
const loader = document.querySelector(".loader");

addCategoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category={
        name:categoryName.value.trim(),
        color:categoryColor.value,
    };

    if(!category.name){
        toastError.textContent="Please enter a category name";
        toastError.classList.add("show");

        setTimeout(() => {
            toastError.classList.remove("show");
        }, 2000);

        return;
    }
    isSubmitting = true;
    categoryBtn.disabled = true;
    loader.classList.add("show");
    try{
        await addDoc(
            collection(db,"categories"),
            category
        );
        toastSucces.textContent="Category Added ";
        toastSucces.classList.add("show");

        setTimeout(() => {
            toastSucces.classList.remove("show");
            window.location.href = "categories.html";
        }, 2000);

       
    }
    catch(error){
        isSubmitting = false;
        categoryBtn.disabled = false;
        loader.classList.remove("show");
        toastError.textContent="Category values ​​were not retrieved."
           toastError.classList.add("show");

    setTimeout(() => {
        toastError.classList.remove("show");
    }, 2000);
    }

});
color.textContent = categoryColor.value.toUpperCase();

categoryColor.addEventListener("input", () => {
    color.textContent = categoryColor.value.toUpperCase();
});


leftIcon.addEventListener("click",()=>{
  window.location.href="categories.html";
  
})
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.href = "login.html";
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

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
});