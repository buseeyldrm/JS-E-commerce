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
    serverTimestamp
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

const seoButton=document.querySelector(".seoButton");
const seoLoader=document.querySelector(".seoButton .loader")

const seoFields = [
    title,
    explanation,
    keyword
];

seoFields.forEach(field => {
    field.addEventListener("input", () => {
        if (field.value.trim() !== "") {
            field.classList.remove("input-error");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadSeo();
    
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

seoButton.addEventListener("click", async(e)=>{
    e.preventDefault();
  
    let hasError=false;

    seoFields.forEach(field=>{
        field.classList.remove("input-error");
    });

    seoFields.forEach(field=>{
        if(field.value.trim()===""){
            field.classList.add("input-error");
            hasError=true;
        }
    });

     if (hasError) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

    seoButton.disabled = true;
    seoLoader.classList.add("show");
    try 
    {
    await setDoc(doc(db, "settings", "seo"), {
    title: title.value.trim(),
    description: explanation.value.trim(),
    keyword: keyword.value.trim(),
    updatedAt: serverTimestamp()
});


    showToast("SEO information saved successfully.", "success");


    } catch (error) {
        console.log(error);
        showToast("An error occurred while saving.", "error");
    } finally {
        seoLoader.classList.remove("show");
        seoButton.disabled = false;
    }
})
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
async function loadSeo() {

    try {

        const docSnap = await getDoc(doc(db, "settings", "seo"));

        if (!docSnap.exists()) return;

        const data = docSnap.data();

        title.value = data.title || "";
        explanation.value = data.description || "";
        keyword.value = data.keyword || "";

    } catch (error) {
        console.log(error);
    }

}