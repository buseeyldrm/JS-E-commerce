import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


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

const registerForm = document.getElementById("registerForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const birthDate = document.getElementById("birthDate");
const password = document.getElementById("password");
const toast = document.getElementById("toast");
const registerBtn = document.getElementById("registerBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordIcon = document.getElementById("passwordIcon");
const upperCaseRegex = /[A-Z]/;
const lowerCaseRegex = /[a-z]/;
const numberRegex = /[0-9]/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0?5)\d{9}$/;
const gender = document.getElementById("gender");

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         window.location.replace("index.html");
//     }
// });

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

if (!validateInputs()) return;
if (!validateEmail()) return;
if (!validatePhone()) return;
if (!validatePassword()) return;

  registerBtn.disabled = true;
  registerBtn.textContent = "Creating Account...";

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );
  console.log(userCredential.user);


  const user = userCredential.user;

  console.log(user.uid);

  await setDoc(doc(db, "customers", user.uid), {
    uid: user.uid,
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    birthDate: birthDate.value,
    gender: gender.value,
    createdAt: serverTimestamp()
});



    await signOut(auth);

    showToast(
      "Registration successful. Redirecting to login...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

  } catch (error) {
    console.log(error);

    if (error.code === "auth/email-already-in-use") {
      setError(email);
      showToast("Email address already exists.", "error");
    } else if (error.code === "auth/weak-password") {
      setError(password);
      showToast("Password must be at least 6 characters.", "error");
    } else {
      showToast(error.message, "error");
    }
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = "Create Account";
  }
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
togglePassword.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";

    passwordIcon.classList.remove("fa-eye");
    passwordIcon.classList.add("fa-eye-slash");
  } else {
    password.type = "password";

    passwordIcon.classList.remove("fa-eye-slash");
    passwordIcon.classList.add("fa-eye");
  }
});

function setError(input) {
    input.classList.remove("border-gray-300");
    input.classList.add("border-red-500");

}
function clearError(input) {
    input.classList.remove("border-red-500");
    input.classList.add("border-gray-300");
}

function validateInputs() {
    let isValid = true;
    const inputs = [
        firstName,
        lastName,
        email,
        phone,
        birthDate,
        password,
        gender,
    ];
    inputs.forEach((input) => {
        clearError(input);
        if (input.value.trim() === "") {
            setError(input);
            isValid = false;
        }
    });
    if (!isValid) {
        showToast("Please fill in all fields.", "error");
    }
    return isValid;

}

function validatePassword() {
    const pass = password.value.trim();
    if (pass.length < 8) {
        setError(password);
        showToast("Password must be at least 8 characters.", "error");
        return false;
    }

    if (!upperCaseRegex.test(pass)) {
        setError(password);
        showToast("Password must contain at least one uppercase letter.", "error");
        return false;
    }

    if (!lowerCaseRegex.test(pass)) {
        setError(password);
        showToast("Password must contain at least one lowercase letter.", "error");
        return false;
    }

    if (!numberRegex.test(pass)) {
        setError(password);
        showToast("Password must contain at least one number.", "error");
        return false;
    }

    return true;
}
function validatePhone() {
    if (!phoneRegex.test(phone.value.trim())) {
        setError(phone);
        showToast("Phone number is invalid.", "error");
        return false;
    }
    return true;

}
function validateEmail() {
    if (!emailRegex.test(email.value.trim())) {
        setError(email);
        showToast("Email address is invalid.", "error");
        return false;
    }

    return true;
}