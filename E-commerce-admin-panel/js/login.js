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
    setDoc,
    addDoc,
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



const loginPage=document.querySelector(".login-page-sign");
const signUpPage=document.querySelector(".signUp-page");

const showLogin=document.getElementById("showLogin");
const showSignUp=document.getElementById("showSignUp");
const signInButton=document.querySelector(".login-sign-button");

const emailInput=document.getElementById("emailInput");
const passwordInput=document.getElementById("password");

const errorArea=document.querySelector(".error-message");
const errorAreaSign=document.querySelector(".error-message-sign");

const eye = document.querySelector(".fa-eye");
const eyeSlash = document.querySelector(".fa-eye-slash");


showSignUp.addEventListener("click",(e)=>{
    e.preventDefault();
    window.location.href="register.html"
    console.log("Tıklandı");
});

signInButton.addEventListener("click", async (e)=>{
    e.preventDefault();
   
    if(emailInput.value.trim()==="" || passwordInput.value.trim()==="" ){
        errorMessage("Please fill in the blank fields");
        return
    }
   
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = emailInput.value.trim();
    const password=passwordInput.value;


    if (!emailRegex.test(email)) {
    errorMessage("Please enter a valid email address.");
    return;
    }

    if(passwordInput.value.length <8){
        errorMessage("Password must be at least 8 characters!")
        return;
    }

     await signInWithEmailAndPassword(auth, email, password)
    .then(async(userCredential) => {
        localStorage.setItem("user", JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email
        
    }));
        window.location.href = "dashboard.html";
    })
    .catch((error) => {
        errorMessage("Check user information");
    });


})

function errorMessage(errorText) {
    errorArea.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = errorText;
    message.style.color = "red";
    message.style.fontSize = "15px";
    message.classList.add("error-message");
    errorArea.appendChild(message);

    setTimeout(() => {
        errorArea.innerHTML = "";
    }, 1000);
}

eye.addEventListener("click", () => {
  passwordInput.type = "text";

  eye.style.display = "none";
  eyeSlash.style.display = "block";
});

eyeSlash.addEventListener("click", () => {
  passwordInput.type = "password";

  eyeSlash.style.display = "none";
  eye.style.display = "block";
});
