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
const productsBody=document.getElementById("productsBody");
const addBtn=document.querySelector(".add-btn");
const deleteModal =document.getElementById("deleteModal");

const cancelBtn =document.getElementById("cancelBtn");
const checkbox=document.querySelector(".switch input");
const maintenanceLoader = document.querySelector(".changeButton .loader");

const currencyLoader =document.querySelector(".currencyButton .loader");
const changeButton=document.querySelector(".changeButton");
const currencyButton=document.querySelector(".currencyButton");

const maintenanceMode = true
const currencyMode=true
const toastSuccess = document.getElementById("toastSuccess");
const kargo=document.getElementById("kargo");
const time=document.getElementById("time");
const kargoButton=document.querySelector(".kargoButton");
const kargoLoader =document.querySelector(".kargoButton .loader");
const toastError=document.getElementById("toastError");

const contactButton=document.querySelector(".contactButton");
const contactLoader =document.querySelector(".contactButton .loader");

const currency = document.getElementById("currency");
const telNo = document.getElementById("telNo");
const registrationNo = document.getElementById("registrationNo");
const kepNo = document.getElementById("kepNo");
const mersisNo = document.getElementById("mersisNo");
const person = document.getElementById("person");
const callNo = document.getElementById("callNo");
const address = document.getElementById("address");

const fields = [
    telNo,
    registrationNo,
    kepNo,
    mersisNo,
    person,
    callNo,
    address
];
fields.forEach(field => {
    field.addEventListener("input", () => {
        field.classList.remove("input-error");
    });
});

const tabs = document.querySelectorAll("header h4");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");
    });
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

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadShipping();
    loadContactInformation();
    
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

checkbox.addEventListener("change", ()=>{
    if(checkbox.checked){
        console.log("Açık");
    }
    else{
        console.log("Kapalı");
        
    }
})

changeButton.addEventListener("click",(e)=>{
    e.preventDefault();

    if(maintenanceMode){
         changeButton.disabled = true;
        maintenanceLoader.classList.add("show");
        
        setTimeout(() => {
          maintenanceLoader.classList.remove("show");
            changeButton.disabled = false;
            toastSuccess.textContent = "Maintenance mode updated successfully.";
            toastSuccess.classList.add("show");    
        }, 1000);
        return;   
    }
})

currencyButton.addEventListener("click",async (e)=>{
    e.preventDefault();
    currencyButton.disabled=true;
    currencyLoader.classList.add("show");


    try{
        await setDoc(
    doc(db,"settings","currency"),
    {
        currency: currency.value
    } 
    );
        currencyLoader.classList.remove("show");
        currencyButton.disabled = false;

         toastSuccess.textContent = "Currency updated successfully.";
        toastSuccess.classList.add("show");
       
          setTimeout(() => {
            toastSuccess.classList.remove("show");
        }, 2000);


  } 
  catch (error) {
        console.log(error);
        currencyLoader.classList.remove("show");
        currencyButton.disabled = false;
    }
});

async function loadShipping() {

    const settingsSnap = await getDoc(
        doc(db, "settings", "shipping")
    );

    if (!settingsSnap.exists()) return;

    const shippingId = settingsSnap.data().company;

    kargo.value = shippingId;

    const shippingSnap = await getDoc(
        doc(db, "shipping", shippingId)
    );

    if (shippingSnap.exists()) {
        time.value = shippingSnap.data().duration;
    }
}

kargo.addEventListener("change", async () => {
    const shippingSnap = await getDoc(
        doc(db, "shipping", kargo.value)
    );

    if (shippingSnap.exists()) {
        time.value = shippingSnap.data().duration;
    } else {
        time.value = "";
    }
});

kargoButton.addEventListener("click", async (e) => {
    e.preventDefault();

    kargoButton.disabled = true;
    kargoLoader.classList.add("show");

    try {
        await setDoc(
            doc(db, "shipping", kargo.value),
            {
                duration: time.value
            },{
                merge:true
            }
        );

        await setDoc(
            doc(db, "settings", "shipping"),
            {
                company: kargo.value
            }
        );
        kargoLoader.classList.remove("show");
        kargoButton.disabled = false;

        toastSuccess.textContent = "Shipping duration updated successfully.";
        toastSuccess.classList.add("show");

        setTimeout(() => {
            toastSuccess.classList.remove("show");
        }, 2000);

    } catch (error) {
        console.log(error);
    }

    kargoButton.disabled = false;
});

contactButton.addEventListener("click", async (e) => {
    e.preventDefault();

    let hasError = false;

    fields.forEach(field => {
        field.classList.remove("input-error");
    });

  
    fields.forEach(field => {
        if (field.value.trim() === "") {
            field.classList.add("input-error");
            hasError = true;
        }
    });

    if (hasError) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

  
    if (!/^0\d{10}$/.test(telNo.value.trim())) {
        telNo.classList.add("input-error");
        showToast("Phone number must be 11 digits.", "error");
        return;
    }

    
    if (!/^\d{6,}$/.test(registrationNo.value.trim())) {
        registrationNo.classList.add("input-error");
        showToast("Registration number is invalid.", "error");
        return;
    }1

   
    if (!/^[^\s@]+@[^\s@]+\.kep\.tr$/i.test(kepNo.value.trim())) {
    kepNo.classList.add("input-error");
    showToast("Please enter a valid KEP address.", "error");
    return;
}


    if (!/^\d{16}$/.test(mersisNo.value.trim())) {
        mersisNo.classList.add("input-error");
        showToast("MERSIS number must be 16 digits.", "error");
        return;
    }

   
    if (!/^[A-Za-zÇĞİÖŞÜçğıöşü\s]{3,}$/.test(person.value.trim())) {
        person.classList.add("input-error");
        showToast("Please enter a valid person's name.", "error");
        return;
    }

   
    if (!/^(\d{7}|0\d{10})$/.test(callNo.value.trim())) {
        callNo.classList.add("input-error");
        showToast("Call center number is invalid.", "error");
        return;
    }

    
    if (address.value.trim().length < 10) {
        address.classList.add("input-error");
        showToast("Address must be at least 10 characters.", "error");
        return;
    }

    contactButton.disabled = true;
    contactLoader.classList.add("show");

    try {

        await addDoc(collection(db, "contactInformation"), {
            telNo: telNo.value.trim(),
            registrationNo: registrationNo.value.trim(),
            kepNo: kepNo.value.trim(),
            mersisNo: mersisNo.value.trim(),
            person: person.value.trim(),
            callNo: callNo.value.trim(),
            address: address.value.trim(),
            createdAt: serverTimestamp()
        });

        showToast("Contact information saved successfully.", "success");

        fields.forEach(field => {
            field.value = "";
            field.classList.remove("input-error");
        });

    } catch (error) {
        console.error(error);
        showToast("An error occurred while saving.", "error");
    } finally {
        contactButton.disabled = false;
        contactLoader.classList.remove("show");
    }
});

async function loadContactInformation() {
    try {
        const snapshot = await getDocs(collection(db, "contactInformation"));

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();

            telNo.value = data.telNo || "";
            registrationNo.value = data.registrationNo || "";
            kepNo.value = data.kepNo || "";
            mersisNo.value = data.mersisNo || "";
            person.value = data.person || "";
            callNo.value = data.callNo || "";
            address.value = data.address || "";
        }

    } catch (error) {
        console.log(error);
    }
}