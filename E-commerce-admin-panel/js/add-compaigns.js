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
    getDocs,
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

const form = document.getElementById("addCampaignForm");

const toastSucces = document.getElementById("toastSucces");
const toastError=document.getElementById("toastError");

const leftIcon=document.querySelector(".fa-circle-left");

const productImage=document.getElementById("productImage");
let imageBase64="";
const previewImage = document.getElementById("previewImage");
const previewBox=document.querySelector(".previewBox")

const campaignTitle = document.getElementById("productName");
const campaignDescription = document.getElementById("campaignDescription");
const campaignLink = document.getElementById("campaignLink");
let isSubmitting = false;
const loader = document.querySelector(".loader");
const addCompaignBtn=document.querySelector(".add-compaignBtn")


campaignDescription.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});


productImage.addEventListener("change",()=>{
  const file=productImage.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onloadend = () => {
        imageBase64 = reader.result;
        previewImage.src=imageBase64;
        previewImage.hidden=false;
        previewBox.hidden=true;

        console.log(imageBase64);
    }

    reader.readAsDataURL(file);

  });

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


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const campaign = {
        title: campaignTitle.value.trim(),
        description: campaignDescription.value.trim(),
        link: campaignLink.value.trim(),
        image: imageBase64,
        createdAt: new Date()
    };
  

   if (!campaign.title) {
    toastError.textContent = "Please enter a campaign title.";
    } else if (!campaign.description) {
        toastError.textContent = "Please enter a campaign description.";
    } else if (!campaign.link) {
        toastError.textContent = "Please enter a campaign link.";
    } else if (!campaign.image) {
        toastError.textContent = "Please select a campaign image.";
    } else {
        
    }

if (
    !campaign.title ||
    !campaign.description ||
    !campaign.link ||
    !campaign.image
) {
    toastError.classList.add("show");

    setTimeout(() => {
        toastError.classList.remove("show");
    }, 2000);

    return;
}
    
    isSubmitting = true;
    addCompaignBtn.disabled = true;
    loader.classList.add("show");   

    try {

        await addDoc(
            collection(db, "campaigns"),
            campaign
        );
         loader.classList.remove("show");
        addCompaignBtn.disabled = false;
        toastSucces.classList.add("show");

        setTimeout(() => {
            window.location.href = "campaigns.html";
        }, 2000);

    } catch (error) {

        console.error(error);
        isSubmitting = false;
        addCompaignBtn.disabled = false;
        loader.classList.remove("show");
         if (error.message.includes('The value of property "image" is longer')) {
         toastError.textContent = "Image size is too large. Please select a smaller image.";
        } else {
        toastError.textContent = "Campaign could not be added.";
        }

toastError.classList.add("show");

        setTimeout(() => {
            toastError.classList.remove("show");
        }, 2000);

    }

});