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

const cancelBtn =document.getElementById("cancelBtn");

const confirmDeleteBtn =document.getElementById("confirmDeleteBtn");
let selectedProductId = null;

const detailModal = document.getElementById("detailModal");
const detailBody = document.getElementById("detailBody");
const closeDetailModal = document.getElementById("closeDetailModal");

const multiSelects=document.querySelectorAll(".multi-select");
const select=document.querySelector(".select");
const statusBtn=document.querySelector(".status-btn");
const statusDropdown=document.querySelector(".status-dropdown");


let categoryCheckboxes;
let vatCheckboxes;
let statusCheckboxes;
let rates = null;


multiSelects.forEach((multiSelect)=>{
const selectBtn=multiSelect.querySelector(".select-btn");
const dropdown=multiSelect.querySelector(".dropdown");

selectBtn.addEventListener("click",()=>{
    dropdown.classList.toggle("show");
});

});

document.addEventListener("click",(e)=>{
    multiSelects.forEach((multiSelect)=>{
        const dropdown=multiSelect.querySelector(".dropdown");

        if(!multiSelect.contains(e.target)){
            dropdown.classList.remove("show");
        }
    })
});

statusBtn.addEventListener("click",()=>{
    statusDropdown.classList.toggle("show");
    console.log("tıklandı")
})
document.addEventListener("click",(e)=>{
    if(!select.contains(e.target)){
      statusDropdown.classList.remove("show");  
    }
    
})


addBtn.addEventListener("click",()=>{
    window.location.href="add-product.html"
})


document.addEventListener("DOMContentLoaded", async() => {

      rates = await getRates();

    categoryCheckboxes = document.querySelectorAll("#categoryFilter input");
    vatCheckboxes = document.querySelectorAll("#vatFilter input");
    statusCheckboxes = document.querySelectorAll("#statusFilter input");

    console.log(categoryCheckboxes.length);

    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }

    loadUser();
    loadProducts();
      [
        ...categoryCheckboxes,
        ...vatCheckboxes,
        ...statusCheckboxes
    ].forEach(cb => {
        cb.addEventListener("change", loadProducts);
    });
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
function getSelectedValues(nodeList) {
    return [...nodeList]
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

async function loadProducts() {

    const currencyDoc = await getDoc(
        doc(db, "settings", "currency")
    );

    const selectedCurrency = currencyDoc.data().currency;
    const categorySnapshot = await getDocs(collection(db, "categories"));

        const categoryMap = {};

        categorySnapshot.forEach((docSnap) => {
            categoryMap[docSnap.id] = docSnap.data().name;
        });

    const querySnapshot = await getDocs(collection(db, "products"));
    const selectedCategories = getSelectedValues(categoryCheckboxes);

    console.log("Seçilen kategoriler:", selectedCategories);
    const selectedVats = getSelectedValues(vatCheckboxes);
    const selectedStatuses = getSelectedValues(statusCheckboxes);

    productsBody.innerHTML = "";

    let index = 1;
   

    querySnapshot.forEach((docSnap) => {

       const product = docSnap.data();

         const image =
        product.images?.[product.defaultImage ?? 0] ||
        product.image ||
        "";
       console.log("Kategori:", product.category);

     if (
    selectedCategories.length > 0 &&
    !selectedCategories.includes(product.slug)
) {
    return;
}

    if (
    selectedVats.length >0 &&
    !selectedVats.includes(`%${product.vat}`)
    ){
        return;
    }
    if (
    selectedStatuses.length > 0 &&
    !selectedStatuses.includes((product.status || "").toLowerCase())
    ) {
        return;
    }


        const productId = docSnap.id;

        let price = product.price;
        let symbol = "₺";


        const usdPrice = product.price / rates.TRY;

        if (selectedCurrency === "USD") {
            price = usdPrice.toFixed(2);
            symbol = "$";
        }
        else if (selectedCurrency === "EUR") {
            price = (usdPrice * rates.EUR).toFixed(2);
            symbol = "€";
        }
        else if (selectedCurrency === "GBP") {
            price = (usdPrice * rates.GBP).toFixed(2);
            symbol = "£";
        }
        productsBody.innerHTML += `
        <tr>
            <td>${index}</td>
            <td>
                <img src="${image}" width="70" height="60" style="object-fit: cover;">
            </td>
            <td>${product.name}</td>
            <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
            <td>${price} ${symbol}</td>
            <td>%${product.vat}</td>
            <td>${product.stock}</td>
            <td>${product.status}</td>
           <td class="action-buttons">

            <button class="detail-btn" data-id="${productId}">
                <i class="fa-solid fa-eye"></i>
            </button>

            <button class="edit-btn" data-id="${productId}">
                <i class="fa-solid fa-pen"></i>
            </button>

            <button class="delete-btn" data-id="${productId}">
                <i class="fa-solid fa-trash"></i>
            </button>

        </td>
        </tr>
        `;

        index++;
    });

    

}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    selectedProductId =e.target.dataset.id;
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
      doc(db, "products", selectedProductId)
    );
    deleteModal.classList.remove("show");
    loadProducts();
  }
);

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".edit-btn");

  if (btn) {
    const id = btn.dataset.id;
    window.location.href = `edit-product.html?id=${id}`;
  }
});

async function getRates() {

    const response = await fetch(
         "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_YSJMuZ9CYQJBqcARbc91DOUmFtdAdVoKvhWlSphe"
    );

    console.log(response);

    const data = await response.json();

    console.log(data);

    return data.data;
}

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".detail-btn");

    if(!btn) return;

    const productId = btn.dataset.id;

    const docSnap = await getDoc(doc(db,"products",productId));

    if(!docSnap.exists()) return;

    const product = docSnap.data();

    const image =
        product.images?.[product.defaultImage ?? 0] ||
        product.images?.[0] ||
        "";

    const categoryDoc = await getDoc(
        doc(db, "categories", product.categoryId)
    );

    let categoryName = "-";

    if (categoryDoc.exists()) {
        categoryName = categoryDoc.data().name;
    }


    let html = `
    <div class="detail-grid">

    <div class="detail-image">
    <img src="${image}" alt="${product.name}">
    </div>

    <div class="detail-info">

        <div class="detail-item">
            <span>Name</span>
            <strong>${product.name}</strong>
        </div>

        <div class="detail-item">
            <span>Category</span>
            <strong>${categoryName}</strong>
        </div>

        <div class="detail-item ">
            <span>Price</span>
            <strong>${product.price} ₺</strong>
        </div>

        <div class="detail-item">
            <span>Stock</span>
            <strong>${product.stock}</strong>
        </div>

        <div class="detail-item">
            <span>VAT</span>
            <strong>%${product.vat}</strong>
        </div>

        <div class="detail-item">
            <span>Status</span>
            <strong>${product.status}</strong>
        </div>

    </div>

    </div>
`;
if (product.attributes) {

    html += `<h3>Attributes</h3>`;

    for (const key in product.attributes) {

        html += `
            <div class="detail-item">
                <span>${key}</span>
                <strong>${product.attributes[key]}</strong>
            </div>
        `;
    }
}
    detailBody.innerHTML = html;
    detailModal.classList.add("show");
});
closeDetailModal.addEventListener("click", () => {
    detailModal.classList.remove("show");
});