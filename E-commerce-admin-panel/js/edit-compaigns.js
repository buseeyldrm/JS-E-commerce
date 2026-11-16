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
const campaignId = params.get("id");
const leftIcon=document.querySelector(".fa-circle-left");

const form = document.getElementById("editCompaignForm");


const toastSucces = document.getElementById("toastSucces");
const toastError = document.getElementById("toastError");
const addCategoriesBtn=document.querySelector(".add-categories");

const campaignTitle = document.getElementById("campaignTitle");
const campaignDescription = document.getElementById("campaignDescription");
const campaignLink = document.getElementById("campaignLink");

const productImage = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");
const previewBox = document.querySelector(".previewBox");
const loader = document.querySelector(".loader");
const addCompaignBtn=document.querySelector(".add-compaignBtn");

let isSubmitting = false;

let imageBase64 = "";

leftIcon.addEventListener("click",()=>{
  window.location.href="campaigns.html";
  
})

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadCampaign();
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

async function loadCampaign() {
 const docSnap = await getDoc(
  doc(db, "campaigns", campaignId)
);

  if (!docSnap.exists()) return;

  const campaign = docSnap.data();
     campaignTitle.value = campaign.title;
    campaignDescription.value = campaign.description;
    campaignLink.value = campaign.link;
    imageBase64 = campaign.image;
    previewImage.src = campaign.image;
    previewImage.hidden = false;
    previewBox.hidden = true;

}
productImage.addEventListener("change", () => {

    const file = productImage.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

        imageBase64 = reader.result;

        previewImage.src = imageBase64;
        previewImage.hidden = false;
        previewBox.hidden = true;

    };

    reader.readAsDataURL(file);

});


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const campaign = {
        title: campaignTitle.value.trim(),
        description: campaignDescription.value.trim(),
        link: campaignLink.value.trim(),
        image: imageBase64
    };
    isSubmitting = true;
    addCompaignBtn.disabled = true;
    loader.classList.add("show");

    try {
        await updateDoc(
            doc(db, "campaigns", campaignId),
            campaign
        );
        loader.classList.remove("show");
        addCompaignBtn.disabled = false;

        toastSucces.textContent = "Campaign updated successfully.";
        toastSucces.classList.add("show");

        setTimeout(() => {
            window.location.href = "campaigns.html";
        }, 2000);

    } catch (error) {
        console.log(error);
         isSubmitting = false;
        addCategoriesBtn.disabled = false;
        loader.classList.remove("show");

         if (error.message.includes('The value of property "image" is longer')) {
         toastError.textContent = "Image size is too large. Please select a smaller image.";
        } else {
        toastError.textContent = "Campaign could not be added.";
         toastError.classList.add("show");
        }


        setTimeout(() => {
            toastError.classList.remove("show");
        }, 2000);
    }
});