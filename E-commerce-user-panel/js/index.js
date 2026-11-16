import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged
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


const categoryDropdown = document.getElementById("categoryDropdown");
const categoryCards = document.getElementById("categoryCards");
const tshirtCards=document.getElementById("tshirtCards");
const shoesCards=document.getElementById("shoesCards");
const selectedLocation = document.getElementById("selectedLocation");
const locationItems = document.querySelectorAll(".location-item");
const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const basketCard=document.querySelector(".basket-card")
const logoutBtn = document.getElementById("logoutBtn");
const basketCount=document.getElementById("basketCount");
const basketIcon=document.getElementById("basket-icon");
const trendBy=document.getElementById("trendBy");
const toast=document.getElementById("toast");

let rates = null;

trendBy.addEventListener("click",()=>{
    window.location.href="index.html"
    
})

document.addEventListener("DOMContentLoaded", async () => {

    rates = await getRates();

    await loadSelectedCurrency();
    await loadCategories();

    loadProducts("headphones", "headphonesCards");
    loadProducts("t-shirt", "tshirtCards");
    loadProducts("sportShoes", "shoesCards");


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
    categoryCards.innerHTML = "";

    querySnapshot.forEach((docSnap) => {

    const category = docSnap.data();

    categoryCards.innerHTML += `
        <a href="${category.route}">
    <div
        class="relative h-[220px] rounded-2xl overflow-hidden bg-cover bg-center cursor-pointer shadow-md hover:scale-105 duration-300"
        style="background-image:url('${category.image}')"
    >
        <div class="absolute inset-0 bg-black/20"></div>

        <h3 class="absolute bottom-5 left-5 text-white text-2xl font-bold">
            ${category.name}
        </h3>
    </div>
</a>
    `;
});
}
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const snapshot = await getDocs(
        collection(db, "basket", user.uid, "products")
    );

    if (snapshot.size > 0) {
        basketCount.textContent = snapshot.size;
        basketCount.classList.remove("hidden");
    } else {
        basketCount.classList.add("hidden");
    }
});

async function loadProducts(category, containerId) {

    const container = document.getElementById(containerId);

    showProductSkeleton(containerId);

    try {

        if (!rates) return;

        const currencyDoc = await getDoc(
            doc(db, "settings", "currency")
        );

        const selectedCurrency = currencyDoc.data().currency;

        const q = query(
            collection(db, "products"),
            where("subCategory", "==", category)
        );

        const querySnapshot = await getDocs(q);

      
        container.innerHTML = "";

        querySnapshot.forEach((docSnap) => {

            const product = {
                id: docSnap.id,
                ...docSnap.data()
            };

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

            const image =
                product.images?.[product.defaultImage ?? 0] ||
                product.image;

            container.innerHTML += `
                <div class="rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 pb-5">

                    <a href="product-detail.html?id=${product.id}">
                        <div class="relative bg-[#F5F5F5] rounded-2xl h-[350px] overflow-hidden flex items-center justify-center">

                            <img
                                src="${image}"
                                alt="${product.name}"
                                class="w-full object-contain"
                            >

                            <button
                                class="group absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 hover:bg-red-500">
                                <i class="fa-regular fa-heart text-gray-600 group-hover:text-white transition-colors duration-300"></i>
                            </button>

                        </div>

                        <div class="mt-4 px-4">
                            <h3 class="text-[16px] font-semibold">${product.name}</h3>

                            <p class="font-bold text-[22px]">
                                ${price} ${symbol}
                            </p>
                        </div>

                        <p class="text-gray-500 mt-2 px-4">
                            ${product.desc}
                        </p>

                        <div class="flex items-center gap-2 mt-3 px-4">
                            <div class="text-green-500">
                                ${createStars(product.rating)}
                            </div>

                            <span class="text-gray-500 text-sm">
                                (${product.reviewCount})
                            </span>
                        </div>

                        <button
                            class="mt-5 border rounded-full px-8 py-3 hover:bg-[#003D28] hover:text-white duration-300 cursor-pointer mx-4"
                            onclick="addBasket('${product.id}')">
                            Add to Cart
                        </button>

                    </a>

                </div>
            `;
        });

    } catch (err) {

        console.error(err);

        container.innerHTML = `
            <div class="text-center py-10 text-red-500">
                Products could not be loaded.
            </div>
        `;

    }
}
function createStars(rating) {
let stars = "";

for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
        stars += "★";
     } else {
        stars += "☆";
    }
}
return stars;
}

logoutBtn.addEventListener("click", async () => {

    try {
        await signOut(auth);
        window.location.href = "login.html";

    } catch (error) {
        console.log(error);
    }

});

async function getRates() {
    try {
        const response = await fetch(
            "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_YSJMuZ9CYQJBqcARbc91DOUmFtdAdVoKvhWlSphe"
        );

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        const data = await response.json();

        console.log(data);

        if (!data.data) {
            throw new Error(data.message || "API response is invalid");
        }

        return data.data;

    } catch (err) {
        console.error("Currency API Error:", err);
        return null;
    }
}
async function loadSelectedCurrency() {

    const docSnap = await getDoc(doc(db,"settings","currency"));

    if(!docSnap.exists()) return;

    const currency = docSnap.data().currency;

    if(currency === "TRY"){
        selectedLocation.textContent = "🇹🇷 Turkey";
    }
    else if(currency === "USD"){
        selectedLocation.textContent = "🇺🇸 United States";
    }
    else if(currency === "EUR"){
        selectedLocation.textContent = "🇪🇺 European Union";
    }
    else if(currency === "GBP"){
        selectedLocation.textContent = "🇬🇧 United Kingdom";
    }
}
locationItems.forEach(item => {

    item.addEventListener("click", async () => {

        const currency = item.dataset.currency;

        await updateDoc(
            doc(db,"settings","currency"),
            {
                currency: currency
            }
        );

        await loadSelectedCurrency();

        loadProducts("headphones","headphonesCards");
        loadProducts("tshirt","tshirtCards");
        loadProducts("sportShoes","shoesCards");
    });

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
async function addBasket(productId){

    const user = auth.currentUser;

    if(!user){
        alert("Please login first");
        return;
    }

    const basketRef = doc(
        db,
        "basket",
        user.uid,
        "products",
        productId
    );

    const basketSnap = await getDoc(basketRef);

    if(basketSnap.exists()){

        await updateDoc(basketRef,{
            quantity: increment(1)
        });

    }else{

        await setDoc(basketRef,{
            quantity:1,
            addedAt: Date.now()
        });

    }
    showToast("Product added to basket");

    const basketSnapshot = await getDocs(
        collection(db,"basket",user.uid,"products")
    );

    basketCount.textContent = basketSnapshot.size;
    basketCount.classList.remove("hidden");
}

window.addBasket = addBasket;
basketIcon.addEventListener("click",()=>{
    window.location.href="basket.html";
   
})

function showToast(message){
    toast.textContent=message;
     toast.classList.remove("translate-x-[400px]"); 

     setTimeout(()=>{
          toast.classList.add("translate-x-[400px]");
     }, 2000)
}
function showProductSkeleton(containerId, count = 5){

    const container = document.getElementById(containerId);

    container.innerHTML = "";

    for(let i=0;i<count;i++){

        container.innerHTML += `
            <div class="rounded-2xl bg-white shadow-sm p-4">

                <div class="skeleton h-[350px] rounded-2xl"></div>

                <div class="skeleton h-6 rounded mt-5"></div>

                <div class="skeleton h-5 rounded mt-3 w-1/3"></div>

                <div class="skeleton h-4 rounded mt-3"></div>

                <div class="skeleton h-4 rounded mt-2 w-3/4"></div>

                <div class="skeleton h-12 rounded-full mt-6"></div>

            </div>
        `;
    }
}

