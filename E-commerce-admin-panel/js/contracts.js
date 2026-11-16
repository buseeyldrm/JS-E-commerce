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
    serverTimestamp,
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

const editors = document.querySelectorAll(".termsOfUse, .confidentialityAgreement");
const termsEditor = document.getElementById("termsEditor");
const privacyEditor = document.getElementById("privacyEditor");

const saveTermsBtn = document.getElementById("saveTermsBtn");
const savePrivacyBtn = document.getElementById("savePrivacyBtn");

const termsLoader = document.getElementById("termsLoader");
const privacyLoader = document.getElementById("privacyLoader");



document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadContracts();
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

editors.forEach(editor => {

    const content = editor.querySelector(".editor");

    const boldBtn = editor.querySelector(".boldBtn");
    const italicBtn = editor.querySelector(".italicBtn");
    const underlineBtn = editor.querySelector(".underlineBtn");

    const increaseSize = editor.querySelector(".increaseSize");
    const decreaseSize = editor.querySelector(".decreaseSize");
    const fontSizeValue = editor.querySelector(".fontSizeValue");

    const unorderedList = editor.querySelector(".unorderedList");
    const orderedList = editor.querySelector(".orderedList");
    const textColor = editor.querySelector(".textColor");
    const backgroundColor = editor.querySelector(".backgroundColor");
    const alignButtons = editor.querySelectorAll(".alignOptions button");

    const alignMenu = editor.querySelector(".align-menu");
    const alignToggle = editor.querySelector(".alignToggle");

    alignToggle.addEventListener("click", () => {

    alignMenu.classList.toggle("open");

});

    boldBtn.addEventListener("click", () => {
        content.focus();
        document.execCommand("bold");
});

    italicBtn.addEventListener("click", () => {
        content.focus();
        document.execCommand("italic");
    });

    underlineBtn.addEventListener("click", () => {
        content.focus();
        document.execCommand("underline");
    });

    increaseSize.addEventListener("click", () => {
        let size = parseInt(fontSizeValue.textContent);
        size++;
        fontSizeValue.textContent = size;
        applyFontSize(size);

    });

    decreaseSize.addEventListener("click", () => {
    let size = parseInt(fontSizeValue.textContent);
    if (size <= 8) return;
    size--;
    fontSizeValue.textContent = size;
    applyFontSize(size);

});


    unorderedList.addEventListener("click", () => {
        content.focus();
        document.execCommand("insertUnorderedList");
    });

    orderedList.addEventListener("click", () => {
        content.focus();
        document.execCommand("insertOrderedList");
    });

    textColor.addEventListener("input", () => {
        content.focus();
        document.execCommand("foreColor", false, textColor.value);
    });
    backgroundColor.addEventListener("input", () => {
        content.focus();
        document.execCommand("backColor", false, backgroundColor.value);
    });

   alignButtons.forEach(button => {

    button.addEventListener("click", () => {

        content.focus();

        const align = button.dataset.align;

        if (align === "left") {
            document.execCommand("justifyLeft");
        }

        if (align === "center") {
            document.execCommand("justifyCenter");
        }

        if (align === "right") {
            document.execCommand("justifyRight");
        }

        if (align === "justify") {
            document.execCommand("justifyFull");
        }

        alignMenu.classList.remove("open");

    });

});
});
function applyFontSize(size) {

    const selection = window.getSelection();

    if (!selection.rangeCount) return;
    if (selection.isCollapsed) return;

    const range = selection.getRangeAt(0);

    let parent = selection.anchorNode;

    if (parent.nodeType === Node.TEXT_NODE) {
        parent = parent.parentElement;
    }

    if (parent.tagName === "SPAN") {

        parent.style.fontSize = `${size}px`;
        return;

    }
    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;

    try {
        range.surroundContents(span);

    } catch {
        span.appendChild(range.extractContents());
        range.insertNode(span);

    }

    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.selectNodeContents(span);

    selection.addRange(newRange);

}
function getCurrentFontSize() {

    const selection = window.getSelection();

    if (!selection.rangeCount) return 16;

    let node = selection.anchorNode;

    if (node.nodeType === 3) {
        node = node.parentElement;
    }

    const size = window.getComputedStyle(node).fontSize;

    return parseInt(size);

}

async function loadContracts() {

    const termsSnap = await getDoc(doc(db, "contracts", "terms"));

    if (termsSnap.exists()) {
        termsEditor.innerHTML = termsSnap.data().content || "";
    }

    const privacySnap = await getDoc(doc(db, "contracts", "privacy"));

    if (privacySnap.exists()) {
        privacyEditor.innerHTML = privacySnap.data().content || "";
    }
}
saveTermsBtn.addEventListener("click", async () => {

    saveTermsBtn.disabled = true;
    termsLoader.classList.add("show");

    try {

   await setDoc(
    doc(db, "contracts", "terms"),
    {
        content: termsEditor.innerHTML,
        updatedAt: serverTimestamp()
    }
);

        showToast("Terms saved successfully", "success");

    } catch (error) {
        console.log(error);
        showToast("Do not enter a blank value.", "error");

    } finally {

        saveTermsBtn.disabled = false;
        termsLoader.classList.remove("show");
    }

});
savePrivacyBtn.addEventListener("click", async () => {

    savePrivacyBtn.disabled = true;
    privacyLoader.classList.add("show");

    try {

       await setDoc(
    doc(db, "contracts", "privacy"),
    {
        content: privacyEditor.innerHTML,
        updatedAt: serverTimestamp()
    }
);

        showToast("Confidentiality Agreement saved successfully", "success");

    } catch (error) {

        showToast("Do not enter a blank value.", "error");

    } finally {

        savePrivacyBtn.disabled = false;
        privacyLoader.classList.remove("show");
    }

});

