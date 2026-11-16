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

const trendBy=document.getElementById("trendyBy");
const categoryDropdown = document.getElementById("categoryDropdown");
const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const basketCard=document.querySelector(".basket-card")
const logoutBtn = document.getElementById("logoutBtn");
const basketCount=document.getElementById("basketCount");
const basketIcon=document.getElementById("basket-icon");
const allClothesCard=document.getElementById("allClothesCards");
const typeBtn = document.getElementById("typeBtn");
const typeDropdown = document.getElementById("typeDropdown");

const colorBtn = document.getElementById("colorBtn");
const colorDropdown = document.getElementById("colorDropdown");

const sizeBtn = document.getElementById("sizeBtn");
const sizeDropdown = document.getElementById("sizeDropdown");

const sortBtn = document.getElementById("sortBtn");
const sortDropdown = document.getElementById("sortDropdown");
const toast=document.getElementById("toast");
let rates = null;

let selectedType = "";
let selectedColor = "";
let selectedSize = "";
let selectedSort = "";


document.addEventListener("DOMContentLoaded", async () => {

    rates = await getRates();

    loadClothesProducts();
    loadTypes();
    loadColors();
    loadSizes();
    loadSort();
    loadCategories();

});
typeBtn.addEventListener("click", () => {
    typeDropdown.classList.toggle("hidden");

});
colorBtn.addEventListener("click", () => {
    colorDropdown.classList.toggle("hidden");
});

sizeBtn.addEventListener("click", () => {
    sizeDropdown.classList.toggle("hidden");
});

sortBtn.addEventListener("click", () => {
    sortDropdown.classList.toggle("hidden");
});
function selectType(type) {
    document.getElementById("typeText").textContent = type;
    selectedType = type;
    typeDropdown.classList.add("hidden");
    loadClothesProducts();
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
async function loadTypes() {

    const snapshot = await getDocs(
        query(
            collection(db, "products"),
            where("subCategory", "==", "clothes")
        )
    );

    typeDropdown.innerHTML = "";


    typeDropdown.innerHTML += `
        <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type=""
        >
            All
        </div>
         <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="T-shirt"
        >
            T-shirt
        </div>
         <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Tracksuit"
        >
            Tracksuit
        </div>
         <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Coat"
        >
            Coat
        </div>
           <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Dress"
        >
            Dress
        </div>
           <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Jacket"
        >
            Jacket
        </div>
           <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Jeans"
        >
            Jeans
        </div>
           <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Pants"
        >
            Pants
        </div>
         </div>
           <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-type="shirt">
            Shirt
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-type="skirt">
            Skirt
        </div>
    `;

    typeDropdown.querySelectorAll("[data-type]").forEach(item => {

        item.addEventListener("click", () => {

            selectedType = item.dataset.type;

            document.getElementById("typeText").textContent =
                selectedType || "Type";

            typeDropdown.classList.add("hidden");

            loadClothesProducts();

        });

    });

}
async function loadClothesProducts() {
    showProductSkeleton("allClothesCards");

    let q = query(
        collection(db, "products"),
        where("slug", "==", "clothes")
    );

    const snapshot = await getDocs(q);

      const currencyDoc = await getDoc(
                doc(db, "settings", "currency")
            );
            const selectedCurrency = currencyDoc.exists()
    ? currencyDoc.data().currency
    : "TRY";
    let products = [];

    snapshot.forEach((doc) => {
        products.push({
            id: doc.id,
            ...doc.data()
        });
    });


    if (selectedType) {
        products = products.filter(
            product => product.attributes?.type === selectedType
        );
    }


    if (selectedColor) {
        products = products.filter(
            product => product.attributes?.color === selectedColor
        );
    }


    if (selectedSize) {
        products = products.filter(
            product => product.attributes?.size === selectedSize
        );
    }


    if (selectedSort === "low") {
        products.sort((a, b) => a.price - b.price);
    }

    if (selectedSort === "high") {
        products.sort((a, b) => b.price - a.price);
    }

    allClothesCard.innerHTML = "";

    products.forEach((product) => {
        let price = product.price;
    let symbol = "₺";

    if (rates) {

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
}

        const image =
            product.images?.[product.defaultImage ?? 0] ||
            product.image ||
            "";

           
       allClothesCard.innerHTML += `
        <div class="rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 pb-5 ">

        <div class="relative flex flex-col justify-center items-center">
           <div class="relative bg-[#F5F5F5] rounded-2xl h-[350px] overflow-hidden flex items-center justify-center">

            <a href="product-detail.html?id=${product.id}">
                <img
                    src="${image}"
                    alt="${product.name}"
                    class="w-full  object-contain"
                >
            

                <button
                    class="group absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 hover:bg-red-500">
                    <i class="fa-regular fa-heart text-gray-600 group-hover:text-white transition-colors duration-300"></i>
                </button>

            </div>

            <div class="mt-4  justify-between items-center px-4">
                <h3 class="text-[16px] font-semibold h-15">${product.name}</h3>

                <p class="font-bold text-[22px]">
                    ${price} ${symbol}
                </p>
            </div> 

           <p class="text-gray-500 mt-2 px-4 h-16">
            ${product.desc}
            </p>
 

        </a>
            <button
                class="mt-5 border rounded-full px-8 py-3 hover:bg-[#003D28] hover:text-white duration-300 cursor-pointer mx-4 flex justify-center items-center" onclick="addBasket('${product.id}')">
                Add to Cart
            </button>
    </div>
        </div>
       
        `;
    });

    console.log("Type:", selectedType);
    console.log("Color:", selectedColor);
    console.log("Size:", selectedSize);
    console.log("Sort:", selectedSort);
}
async function loadColors() {

    colorDropdown.innerHTML = `
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-color="">
            All
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-color="Black">
            Black
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-color="White">
            White
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-color="Blue">
            Blue
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-color="Red">
            Red
        </div>
    `;

    colorDropdown.querySelectorAll("[data-color]").forEach(item => {

        item.addEventListener("click", () => {

            selectedColor = item.dataset.color;

            document.getElementById("colorText").textContent =
                selectedColor || "Color";

            colorDropdown.classList.add("hidden");

            loadClothesProducts();

        });

    });

}
async function loadSizes() {

    sizeDropdown.innerHTML = `
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="">
            All
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="S">
            S
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="M">
            M
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="L">
            L
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="XL">
            XL
        </div>
    `;

    sizeDropdown.querySelectorAll("[data-size]").forEach(item => {

        item.addEventListener("click", () => {

            selectedSize = item.dataset.size;

            document.getElementById("sizeText").textContent =
                selectedSize || "Size";

            sizeDropdown.classList.add("hidden");

            loadClothesProducts();

        });

    });

}
async function loadSort() {

    sortDropdown.innerHTML = `
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-sort="">
            Default
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-sort="low">
            Low to High
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-sort="high">
            High to Low
        </div>
    `;

    sortDropdown.querySelectorAll("[data-sort]").forEach(item => {

        item.addEventListener("click", () => {

            selectedSort = item.dataset.sort;

            document.getElementById("sortText").textContent =
                item.textContent;

            sortDropdown.classList.add("hidden");

            loadClothesProducts();

        });

    });

}
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


function showToast(message){
    toast.textContent=message;
     toast.classList.remove("translate-x-[400px]"); 

     setTimeout(()=>{
          toast.classList.add("translate-x-[400px]");
     }, 2000)
}

async function getRates() {
    try {
        const response = await fetch(
            "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_YSJMuZ9CYQJBqcARbc91DOUmFtdAdVoKvhWlSphe"
        );

        const data = await response.json();
        return data.data;

    } catch (err) {
        console.log(err);
        return null;
    }
}

function showProductSkeleton(containerId, count = 5){

    const container = document.getElementById(containerId);

    container.innerHTML = "";

    for(let i=0;i<count;i++){

        container.innerHTML += `
            <div class="rounded-2xl bg-white shadow-sm pb-5">

                <div class="bg-[#F5F5F5] rounded-2xl h-[350px] overflow-hidden">
                    <div class="skeleton w-full h-full"></div>
                </div>

                <div class="mt-4 px-4">
                    <div class="skeleton h-5 w-3/4 rounded"></div>

                    <div class="skeleton h-6 w-1/3 rounded mt-3"></div>
                </div>

                <div class="px-4 mt-3">
                    <div class="skeleton h-4 rounded"></div>

                    <div class="skeleton h-4 w-2/3 rounded mt-2"></div>
                </div>

                <div class="px-4 mt-5">
                    <div class="skeleton h-12 rounded-full"></div>
                </div>

            </div>
        `;
    }
}