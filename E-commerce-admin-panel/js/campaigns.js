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
const campaignsBody=document.getElementById("campaignBody");

const cancelBtn =document.getElementById("cancelBtn");
const category = document.getElementById("category");

const confirmDeleteBtn =document.getElementById("confirmDeleteBtn");
let selectedCampaignId = null;

const addCampaignsBtn=document.querySelector(".add-campaigns");



addCampaignsBtn.addEventListener("click",()=>{
    window.location.href="add-campaigns.html"
})

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
   loadCampaigns();
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


async function loadCampaigns() {
    const querySnapshot = await getDocs(collection(db, "campaigns"));

    campaignsBody.innerHTML = "";
    let index = 1;

    querySnapshot.forEach((docSnap) => {
        const campaign = docSnap.data();
        const campaignId = docSnap.id;

        campaignsBody.innerHTML += `
            <tr>
                <td>${index}</td>

                <td>${campaign.title}</td>

                <td class="decription-stil">${campaign.description}</td>
              <td><img src="${campaign.image}" width="70"></td>
              <td class="link">
                <a href="${campaign.link}" target="_blank" title="${campaign.link}">
                    ${campaign.link}
                </a>
                </td>

                <td>
                    <button class="edit-btn" data-id="${campaignId}">
                        Edit
                    </button>

                    <button class="delete-btn" data-id="${campaignId}">
                        Delete
                    </button>
                </td>
            </tr>
        `;

        index++;
    });
}


document.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
       selectedCampaignId = e.target.dataset.id;
        deleteModal.classList.add("show");
      }
});
    
cancelBtn.addEventListener("click", () => {
      deleteModal.classList.remove("show");
});
    
confirmDeleteBtn.addEventListener(
      "click",
      async () => {
        await deleteDoc(
          doc(db, "campaigns", selectedCampaignId)
        );
        deleteModal.classList.remove("show");
        loadCampaigns();
        
      }
);
    
document.addEventListener("click", (e) => {
      const btn = e.target.closest(".edit-btn");
    
      if (btn) {
        const id = btn.dataset.id;
        window.location.href = `edit-campaigns.html?id=${id}`;
      }
});
