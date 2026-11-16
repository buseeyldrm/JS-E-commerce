import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    collectionGroup,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAphbaNQ9s1CIzuQxvyBJzuPE_Jbx97ThU",
    authDomain: "e-commerce-2da2e.firebaseapp.com",
    projectId: "e-commerce-2da2e",
    storageBucket: "e-commerce-2da2e.firebasestorage.app",
    messagingSenderId: "84955754034",
    appId: "1:84955754034:web:deb1c90d38d156b9f2162b"
  };



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const basketProducts = document.getElementById("basketProducts");
const productCount = document.getElementById("productCount");
const basketIcon=document.getElementById("basket-icon");
const basketCard=document.querySelector(".basket-card")
const basketCount=document.getElementById("basketCount");
const trendBy=document.getElementById("trendBy");
const deleteModal=document.getElementById("deleteModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
let selectedProductId = "";
const confirmDelete = document.getElementById("confirmDelete");
const categoryDropdown = document.getElementById("categoryDropdown");
const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const logoutBtn = document.getElementById("logoutBtn");
const confirmCart=document.getElementById("confirmCart");


async function loadBasketCount(user) {

    const snapshot = await getDocs(
        collection(db, "basket", user.uid, "products")
    );

    if (snapshot.size > 0) {
        basketCount.textContent = snapshot.size;
        basketCount.classList.remove("hidden");
    } else {
        basketCount.classList.add("hidden");
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadBasket(user);
        loadBasketCount(user);
    } else {
        window.location.href = "login.html";
    }
    loadCategories();
});

async function loadBasket() {

    const user = auth.currentUser;

    if (!user) return;

    const basketSnapshot = await getDocs(
        collection(db, "basket", user.uid, "products")
    );

    productCount.textContent = `(${basketSnapshot.size} Product)`;

    basketProducts.innerHTML = "";

const allBasketProducts = await getDocs(
    collectionGroup(db, "products")
);

basketSnapshot.forEach(async (item) => {

    const basketItem = item.data();


    const productSnap = await getDoc(
        doc(db, "products", item.id)
    );

    const product = productSnap.data();

    const settingsSnap = await getDoc(
        doc(db, "settings", "shipping")
    );

    const shippingId = settingsSnap.data().company;

    const shippingSnap = await getDoc(
        doc(db, "shipping", shippingId)
    );

    const shipping = shippingSnap.data();

    let basketUserCount = 0;

    allBasketProducts.forEach((docSnap) => {

        const userDoc = docSnap.ref.parent.parent;

        if (!userDoc) return;

        if (docSnap.id === item.id && userDoc.id !== user.uid) {
            basketUserCount++;
        }

    });
    const image =
    product.images?.[product.defaultImage ?? 0] ||
    product.image ;

       basketProducts.innerHTML += `

        <div class="border border-gray-200 shadow-sm mb-5 bg-white" id="basket-${item.id}">
        ${product.price>=1000 ? 
            `<div class="bg-[#EFFBF5] w-full py-2 flex gap-2 justify-center items-center">
            <i class="fa-solid fa-cube text-gray-600 mt-[2px]"></i>
            <p class="font-medium">Free Shipping</p>
            </div>`:""
        }
        
            <div class=" p-5 mb-5 bg-white">

            <div class="flex items-center gap-5">

            <input
            type="checkbox"
            class="basket-checkbox w-5 h-5"
            data-id="${item.id}"
            data-price="${product.price}"
            data-quantity="${basketItem.quantity}"
            data-name="${product.name}"
            data-image="${image}"
            data-shipping="${shipping.name}"
            data-duration="${shipping.duration}"
            data-freeshipping="${product.price >= 1000}">

                <img
            src="${image}"
            class="w-30 h-30 object-contain"
        >

            <div class="flex-1">

                <h3 class="font-semibold text-lg">
                    ${product.name}
                </h3>

                <p class="text-gray-500 mt-1">
                🚚
                    ${shipping.name} • ${shipping.duration} business days
                </p>
                ${basketUserCount > 0
            ? `
            <p class="text-orange-500 mt-1">
                <span><i class="fa-solid fa-cart-shopping text-[13px]"></i></span>
                ${basketUserCount} ${basketUserCount === 1 ? "person" : "people"} have this item in their cart
            </p>
            `
            : ""}

            </div>
            <div class="w-40">
            <button class="flex items-center border border-gray-200 rounded-xl" >
        ${basketItem.quantity > 1
            ? `
            <span 
                id="minus-${item.id}"
                class="w-10 h-10 flex items-center justify-center cursor-pointer"
                onclick="decreaseQuantity('${item.id}')">
                <i class="fa-solid fa-minus text-[#F27A1A]"></i>
            </span>
            `
            : `
            <span
                id="minus-${item.id}"
                class="w-10 h-10 flex items-center justify-center text-gray-300 cursor-not-allowed">
                <i class="fa-solid fa-minus"></i>
            </span>
            `
            }

        <div class="w-8 h-8 rounded-[50%] text-[#F27A1A] bg-[#FFF0E4] flex items-center justify-center font-semibold" id="quantity-${item.id}">
            ${basketItem.quantity}
        </div>

        <span class="w-10 h-10 flex items-center justify-center cursor-pointer " onclick="increaseQuantity('${item.id}')">
            <i class="fa-solid fa-plus text-[#F27A1A]"></i>
        </span>
        </button>
        </div>
        <div class="text-right gap-5  flex flex-col items-end self-start ">
        <button class="flex items-center gap-1 text-black cursor-pointer hover:text-red-700" onclick="openDeleteModal('${item.id}')"><i class="fa-regular fa-trash-can" ></i> <span>Delete</span></button> 


       <p
            id="price-${item.id}"
            data-price="${product.price}"
            class="font-bold text-[#F27A1A] text-xl">
            ₺${product.price * basketItem.quantity}
        </p>
            </div>

        </div>
            </div>
    `;
    });
    document.addEventListener("change", (e) => {
    if (e.target.classList.contains("basket-checkbox")) {
        updateSummary();
    }
});
}

function openDeleteModal(productId) {
    selectedProductId = productId;

    deleteModal.classList.remove("hidden");
}
window.openDeleteModal = openDeleteModal;

confirmDelete.addEventListener("click", deleteProduct);

async function deleteProduct() {
    const user = auth.currentUser;
    await deleteDoc(
        doc(db, "basket", user.uid, "products", selectedProductId)
    );
    deleteModal.classList.add("hidden");
    loadBasket();
    loadBasketCount(user);
}
window.deleteProduct = deleteProduct;
closeModal.addEventListener("click", ()=>{
    deleteModal.classList.add("hidden");
});
cancelBtn.addEventListener("click",()=>{
    deleteModal.classList.add("hidden");
});

async function increaseQuantity(productId) {

    const user = auth.currentUser;
    const productRef = doc(db, "basket", user.uid, "products", productId);
    await updateDoc(productRef, {
        quantity: increment(1)
    });

  
    const quantityEl=document.getElementById(`quantity-${productId}`);
     const priceEl = document.getElementById(`price-${productId}`);
    const checkbox = document.querySelector(`[data-id="${productId}"]`);
      let quantity = Number(quantityEl.textContent);

    quantity++;

    quantityEl.textContent = quantity;

    checkbox.dataset.quantity = quantity;

    const unitPrice = Number(priceEl.dataset.price);

    priceEl.textContent = `₺${unitPrice * quantity}`;
    const minusBtn = document.getElementById(`minus-${productId}`);

if (quantity > 1) {
    minusBtn.classList.remove("cursor-not-allowed", "text-gray-300");
    minusBtn.classList.add("cursor-pointer");
    minusBtn.setAttribute("onclick", `decreaseQuantity('${productId}')`);
    minusBtn.innerHTML = `<i class="fa-solid fa-minus text-[#F27A1A]"></i>`;
}
    updateSummary();
}

window.increaseQuantity = increaseQuantity;

async function decreaseQuantity(productId) {

    const user = auth.currentUser;

    const productRef = doc(db, "basket", user.uid, "products", productId);

    const snap = await getDoc(productRef);

    const data = snap.data();
    const quantityEl = document.getElementById(`quantity-${productId}`);
    const priceEl = document.getElementById(`price-${productId}`);
    const checkbox = document.querySelector(`[data-id="${productId}"]`);
    const minusBtn = document.getElementById(`minus-${productId}`);

    let quantity = Number(quantityEl.textContent);

    if (quantity <= 1) return;

    await updateDoc(productRef, {
        quantity: increment(-1)
    });

    quantity--;

    quantityEl.textContent = quantity;

    checkbox.dataset.quantity = quantity;

    const unitPrice = Number(priceEl.dataset.price);
    priceEl.textContent = `₺${unitPrice * quantity}`;

    if (quantity === 1) {
        minusBtn.classList.remove("cursor-pointer");
        minusBtn.classList.add("cursor-not-allowed", "text-gray-300");
        minusBtn.removeAttribute("onclick");
        minusBtn.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    }

    updateSummary();
    }

window.decreaseQuantity = decreaseQuantity;

function updateSummary() {

    const checkboxes = document.querySelectorAll(".basket-checkbox");

    let subtotal = 0;
    let shipping = 0;

    let hasPaidShipping = false;

    checkboxes.forEach((checkbox) => {

    if (checkbox.checked) {

        const price = Number(checkbox.dataset.price);
        const quantity = Number(checkbox.dataset.quantity);
        const freeShipping = checkbox.dataset.freeshipping === "true";

        subtotal += price * quantity;

        if (!freeShipping) {
            hasPaidShipping = true;
        }
    }
    });
    if (subtotal >= 1000) {
    shipping = 0;
    } else if (hasPaidShipping) {
        shipping = 59;
    } else {
        shipping = 0;
    }

    document.getElementById("summaryPrice").textContent = `₺${subtotal}`;
    document.getElementById("shippingPrice").textContent = `₺${shipping}`;
    document.getElementById("totalPrice").textContent = `₺${subtotal + shipping}`;
}
window.updateSummary = updateSummary;

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {
        console.log(error);
    }

});
searchBox.addEventListener("click", (e) => {

      e.stopPropagation();

    searchBox.classList.remove("w-[300px]");
    searchBox.classList.add("w-[430px]");

    searchInput.classList.remove("hidden");

    searchInput.focus();

});
document.addEventListener("click", (e) => {

    if (!searchBox.contains(e.target)) {

        searchBox.classList.remove("w-[400px]");
        searchBox.classList.add("w-[300px]");
        searchResults.classList.add("hidden");

        searchInput.value = "";
    }

});
searchInput.addEventListener("input", async () => {

    const value = searchInput.value.trim().toLowerCase();

    if (value.length < 3) {
        searchResults.classList.add("hidden");
        searchResults.innerHTML = "";
        return;
    }

    const snapshot = await getDocs(collection(db, "products"));

    searchResults.innerHTML = "";

    snapshot.forEach((docSnap) => {

        const product = {
            id: docSnap.id,
            ...docSnap.data()
        };

        if (!product.name.toLowerCase().includes(value)) return;

        const image =
            product.images?.[product.defaultImage ?? 0] ||
            product.image;

        searchResults.innerHTML += `
            <a
                href="product-detail.html?id=${product.id}"
                class="flex items-center gap-4 p-4 hover:bg-gray-100 transition cursor-pointer"
            >
                <img
                    src="${image}"
                    class="w-16 h-16 object-contain"
                    alt="${product.name}"
                >

                <div class="flex-1">
                    <p class="font-semibold">${product.name}</p>
                </div>

                <p class="font-bold text-[#F27A1A]">
                    ₺${product.price}
                </p>
            </a>
        `;
    });

    searchResults.classList.toggle(
        "hidden",
        searchResults.innerHTML === ""
    );

});

async function loadCategories() {

    const querySnapshot = await getDocs(collection(db, "categories"));

    categoryDropdown.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        const category = docSnap.data();

       categoryDropdown.innerHTML += `
         <a href="${category.route}" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer">
        <span>${category.name}</span>

        </a>
`;
    });
}

confirmCart.addEventListener("click", () => {

    const selectedIds = [];

    document.querySelectorAll(".basket-checkbox").forEach((checkbox) => {

        if (checkbox.checked) {
            selectedIds.push(checkbox.dataset.id);
        }

    });

    if (selectedIds.length === 0) {
        showToast("Select at least one product.","error")
        return;
    }
    showToast("Redirected to the product payment page.")
    window.location.href = `payment.html?ids=${selectedIds.join(",")}`;

});

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.remove(
        "hidden",
        "bg-red-500",
        "bg-green-500"
    );

    if (type === "success") {
        toast.classList.add("bg-green-500");
    } else {
        toast.classList.add("bg-red-500");
    }

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}
