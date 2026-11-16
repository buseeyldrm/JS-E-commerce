import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
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


const nameInput=document.getElementById("name");
const surnameInput=document.getElementById("surname");
const phoneInput=document.getElementById("phone");
const createEmail = document.getElementById("createEmail");
const createPassword=document.getElementById("password");
const signUpButton=document.querySelector(".sign-up-button");
const loginPage=document.querySelector(".login-page-sign");
const signUpPage=document.querySelector(".signUp-page");
const confirmPassword = document.getElementById("passwordConfirm");
const showLogin=document.getElementById("showLogin");
const signInButton=document.querySelector(".login-sign-button");
const errorAreaSign=document.querySelector(".error-message-sign");
const country=document.getElementById("country");
const countryCode=document.getElementById("countryCode");

const passwordInput = document.getElementById("password");



document.querySelectorAll(".password-div").forEach((passwordDiv) => {
    const input = passwordDiv.querySelector("input");
    const eye = passwordDiv.querySelector(".fa-eye");
    const eyeSlash = passwordDiv.querySelector(".fa-eye-slash");

    eye.addEventListener("click", () => {
        input.type = "text";
        eye.style.display = "none";
        eyeSlash.style.display = "block";
    });

    eyeSlash.addEventListener("click", () => {
        input.type = "password";
        eyeSlash.style.display = "none";
        eye.style.display = "block";
    });
});

signUpButton.disabled = true;


showLogin.addEventListener("click",(e)=>{
    e.preventDefault();
    window.location.href="login.html"
})


nameInput.addEventListener("input",()=>{
    if(nameInput.value.trim()==""){
        showError(nameInput,"Name is required");
    }else{
        showSuccess(nameInput);
    }
    checkForm();

});

surnameInput.addEventListener("input", () => {

    if(surnameInput.value.trim()==""){
        showError(surnameInput,"Surname is required");
    }else{
        showSuccess(surnameInput);
    }

    checkForm();
});

phoneInput.addEventListener("input",()=>{
    let digits = phoneInput.value.replace(/\D/g,"");

    if(country.value==="TR"){
        if(digits.startsWith("0")){
            digits=digits.substring(1);
        }
        digits=digits.substring(0,10);

        let formatted="";

        if(digits.length>0){
            formatted+="(" +digits.substring(0,3);
        }
        
        if(digits.length>3){
             formatted+=") " + digits.substring(3,6);
        }
           
        if(digits.length>6){
            formatted+=" " +digits.substring(6,8)
        }
            
        if(digits.length>8){
            formatted+=" " +digits.substring(8,10)
        }

        phoneInput.value=formatted;


          if(/^5\d{9}$/.test(digits)){
            showSuccess(phoneInput);
        }else{
            showError(phoneInput,"Invalid Turkish phone");
        }
    }
    else if(country.value==="US"){
        digits=digits.substring(0,10);

        let formatted="";

        if(digits.length>0){
            formatted+="(" +digits.substring(0,3);}

        if(digits.length>3){
            formatted+=") "+digits.substring(3,6);
        }
        if(digits.length>6){
            formatted+="-"+digits.substring(6);
        }

        phoneInput.value=formatted;

        if(digits.length===10){
            showSuccess(phoneInput);
        }
        else{
            showError(phoneInput,"Invalid US phone");
        }


    }

})
country.addEventListener("input", () => {

    if(country.value.trim()==""){
        showError(country,"Country is required");
    }else{
        showSuccess(country);
    }

    checkForm();

});

createEmail.addEventListener("input",()=>{

    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(createEmail.value.trim()==""){
        showError(createEmail,"Email is required");
    }
    else if(!regex.test(createEmail.value)){
        showError(createEmail,"Invalid email");
    }
    else{
        showSuccess(createEmail);
    }

    checkForm();
});

createPassword.addEventListener("input", () => {
    const password = createPassword.value;

    if (password === "") {
        showError(createPassword, "Password is required");
    }
    else if (password.length < 8) {
        showError(createPassword, "Minimum 8 characters required");
    }
    else if (!/[A-Z]/.test(password)) {
        showError(createPassword, "At least 1 uppercase letter required");
    }
    else if (!/[a-z]/.test(password)) {
        showError(createPassword, "At least 1 lowercase letter required");
    }
    else if (!/\d/.test(password)) {
        showError(createPassword, "At least 1 number required");
    }
    else {
        showSuccess(createPassword);
    }

    checkForm();
    checkPasswords();
});
confirmPassword.addEventListener("input", () => {
    checkPasswords();
});
country.addEventListener("change",()=>{
    if(country.value==="TR"){
        countryCode.value="+90";
    }

    if(country.value==="US"){
        countryCode.value="+1";
    }

    phoneInput.value="";
    document.getElementById("phoneError").textContent = "";
    showError(phoneInput, "Phone number is required");

    checkForm();
})


function checkPasswords() {

    if(confirmPassword.value === ""){
        showError(confirmPassword, "Please confirm your password");
    }
    else if(createPassword.value !== confirmPassword.value){
        showError(confirmPassword, "Passwords do not match");
    }
    else{
        showSuccess(confirmPassword);
    }

    checkForm();
}

function checkForm(){

   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordValid =
    createPassword.value.length >= 8 &&
    /[A-Z]/.test(createPassword.value) &&
    /[a-z]/.test(createPassword.value) &&
    /\d/.test(createPassword.value)
   

    const digits = phoneInput.value.replace(/\D/g, "");

    let phoneValid = false;
      

    if (country.value === "TR") {
        phoneValid = /^5\d{9}$/.test(digits);
    }

    if (country.value === "US") {
        phoneValid = digits.length === 10;
    }

    console.log({
        name: nameInput.value.trim() != "",
        surname: surnameInput.value.trim() != "",
        country: country.value.trim() != "",
        email: emailRegex.test(createEmail.value),
        password:passwordValid,
        confirm: createPassword.value === confirmPassword.value,
        phone: phoneValid
    });

    const valid =
        nameInput.value.trim() != "" &&
        surnameInput.value.trim() != "" &&
        country.value.trim() != "" &&
        emailRegex.test(createEmail.value) &&
       passwordValid &&
        createPassword.value === confirmPassword.value &&
        phoneValid;

    signUpButton.disabled = !valid;
}

function showError(input, message) {

    if(input.id === "phone"){
        document.querySelector(".phone-input").classList.add("error");
        document.querySelector(".phone-input").classList.remove("success");
    }
    else if(input.id === "country"){
        document.querySelector(".country-input").classList.add("error");
        document.querySelector(".country-input").classList.remove("success");
    }
    else{
        input.classList.add("error");
        input.classList.remove("success");
    }

    document.getElementById(input.id + "Error").textContent = message;
}

function showSuccess(input){

    if(input.id === "phone"){
        document.querySelector(".phone-input").classList.add("success");
        document.querySelector(".phone-input").classList.remove("error");
    }
    else if(input.id === "country"){
        document.querySelector(".country-input").classList.add("success");
        document.querySelector(".country-input").classList.remove("error");
    }
    else{
        input.classList.add("success");
        input.classList.remove("error");
    }

    document.getElementById(input.id + "Error").textContent = "";
}

signUpButton.addEventListener("click", (e) => {

    e.preventDefault();

    if(signUpButton.disabled) return;

    createUserWithEmailAndPassword(
        auth,
        createEmail.value,
        createPassword.value
    )
    .then((userCredential) => {

    const user = userCredential.user;

    return setDoc(doc(db, "users", user.uid), {
        name: nameInput.value,
        surname: surnameInput.value,
        phone: phoneInput.value,
        country: country.value,
        email: createEmail.value
    });

})
    .then(() => {
        alert("Account created successfully!");
        window.location.href = "login.html";

    })
    .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
    }
    else {
        alert(error.message);
    }

    });

});



