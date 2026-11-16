import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAphbaNQ9s1CIzuQxvyBJzuPE_Jbx97ThU",
  authDomain: "e-commerce-2da2e.firebaseapp.com",
  projectId: "e-commerce-2da2e",
  storageBucket: "e-commerce-2da2e.firebasestorage.app",
  messagingSenderId: "84955754034",
  appId: "1:84955754034:web:deb1c90d38d156b9f2162b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("loginForm");
const emailOrPhone = document.getElementById("emailOrPhone");
const password = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");
const loginBtn = document.getElementById("loginBtn");
const toast = document.getElementById("toast");
const togglePassword = document.getElementById("togglePassword");
const passwordIcon = document.getElementById("passwordIcon");


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const switchBg = document.getElementById("switchBg");
const switchCircle = document.getElementById("switchCircle");

onAuthStateChanged(auth, (customer) => {
    console.log(customer);
    console.log("kullancı")

    if (customer) {
        window.location.replace("index.html");
    }
});

rememberMe.addEventListener("change", () => {
    if (rememberMe.checked) {
        switchBg.classList.remove("bg-gray-300");
        switchBg.classList.add("bg-black");
        switchCircle.classList.add("translate-x-5");
    } else {
        switchBg.classList.remove("bg-black");
        switchBg.classList.add("bg-gray-300");
        switchCircle.classList.remove("translate-x-5");

    }

});

togglePassword.addEventListener("click", () => {
    if(password.type==="password"){
        password.type="text";
        passwordIcon.classList.replace("fa-eye","fa-eye-slash");
    }else{
        password.type="password";
        passwordIcon.classList.replace("fa-eye-slash","fa-eye");
    }
});

loginForm.addEventListener("submit", async (e) => {
   
    e.preventDefault();
    loginBtn.disabled = true;

    clearError(emailOrPhone);
    clearError(password);

    if (emailOrPhone.value.trim() === "") {
         setError(emailOrPhone);

    showToast("Please enter email or phone.", "error");

    loginBtn.disabled = false;
    loginBtn.innerText = "Sign In";

    return;
    }

    if (password.value.trim() === "") {
        setError(password);
        showToast("Please enter password.", "error");
        loginBtn.disabled = false;
        loginBtn.innerText = "Sign In";

    return;
    }

    let email = emailOrPhone.value.trim();
    if (!/^05\d{9}$/.test(email) && !emailRegex.test(email)) {

    setError(emailOrPhone);
    showToast("Please enter a valid email or phone number.", "error");
    return;
    }
    try {
        
          let userData = null;

        if (/^05\d{9}$/.test(email)) {

        const q = query(
            collection(db, "customers"),
            where("phone", "==", email)
        );

        const snap = await getDocs(q);

        if (snap.empty) {

            showToast("User not found.", "error");

            loginBtn.disabled = false;
            loginBtn.innerText = "Sign In";

            return;
        }

        userData = snap.docs[0].data();
        email = userData.email;

        
    } else {

    const q = query(
        collection(db, "customers"),
        where("email", "==", email)
    );

    const snap = await getDocs(q);

    if (snap.empty) {

        showToast("User not found.", "error");

        loginBtn.disabled = false;
        loginBtn.innerText = "Sign In";

        return;
    }

    userData = snap.docs[0].data();
}

    await signInWithEmailAndPassword(
        auth,
        email,
        password.value
    );
       

            emailOrPhone.value = "";
            password.value = "";

            

        showToast("Login successful.", "success");
        loginBtn.disabled = false;
        loginBtn.innerText = "Signing In...";

        setTimeout(() => {

            window.location.href = "index.html";

        }, 1500);

    } catch (error) {
        console.log(error.code);
   
    console.log(error.message);

    showToast("Email or password is incorrect.", "error");

    loginBtn.disabled = false;
    loginBtn.innerText = "Sign In";

}

});

function setError(input){
    input.classList.remove("border-gray-300");
    input.classList.add("border-red-500");
}

function clearError(input){
    input.classList.remove("border-red-500");
    input.classList.add("border-gray-300");
}

[emailOrPhone, password].forEach((input) => {
    input.addEventListener("input", () => {
        clearError(input);
    });
});

function showToast(message, type = "success") {
    toast.innerHTML = "";
    const div = document.createElement("div");
    div.className = `
        min-w-[320px]
        rounded-lg
        px-5
        py-4
        shadow-xl
        text-white
        font-medium
        flex
        items-center
        gap-3
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
    `;

    div.innerHTML = `
        <i class="fa-solid ${
            type === "success"
                ? "fa-circle-check"
                : "fa-circle-xmark"
        } text-xl"></i>

        <span>${message}</span>
    `;

    toast.appendChild(div);

    toast.classList.remove("translate-x-[500px]");
    toast.classList.add("translate-x-0");

    setTimeout(() => {

        toast.classList.remove("translate-x-0");
        toast.classList.add("translate-x-[500px]");

    }, 3000);

}