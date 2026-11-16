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
const allShoesCard=document.getElementById("allShoesCards");

const typeBtn = document.getElementById("typeBtn");
const typeDropdown = document.getElementById("typeDropdown");

const genderBtn = document.getElementById("genderBtn");
const genderDropdown = document.getElementById("genderDropdown");

const sizeBtn = document.getElementById("sizeBtn");
const sizeDropdown = document.getElementById("sizeDropdown");

const sortBtn = document.getElementById("sortBtn");
const sortDropdown = document.getElementById("sortDropdown");
const toast=document.getElementById("toast");

let selectedType = "";
let selectedGender = "";
let selectedSize = "";
let selectedSort = "";

typeBtn.addEventListener("click", () => {
    typeDropdown.classList.toggle("hidden");

});
genderBtn.addEventListener("click", () => {
   genderDropdown.classList.toggle("hidden");
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
            where("subCategory", "==", "shoes")
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
            data-type="Sport"
        >
            Sport
        </div>
         <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Boots"
        >
            Boots
        </div>
         <div
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            data-type="Heels"
        >
            Heels
        </div>
          
    `;

    typeDropdown.querySelectorAll("[data-type]").forEach(item => {

        item.addEventListener("click", () => {

            selectedType = item.dataset.type;

            document.getElementById("typeText").textContent =
                selectedType || "Type";

            typeDropdown.classList.add("hidden");

            loadShoesProducts();

        });

    });

}
async function loadShoesProducts() {

    let q = query(
        collection(db, "products"),
        where("slug", "==", "shoes")
    );

    const snapshot = await getDocs(q);

    let products = [];

    snapshot.forEach((doc) => {
        products.push({
            id: doc.id,
            ...doc.data()
        });
    });


    if (selectedType) {
        products = products.filter(
            product => product.attributes?.shoeType === selectedType
        );
        console.log("Selected:", selectedType);
    }


    if (selectedGender) {
        products = products.filter(
            product => product.attributes?.gender === selectedGender
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

    allShoesCard.innerHTML = "";

    products.forEach((product) => {

        const image =
            product.images?.[product.defaultImage ?? 0] ||
            product.image ||
            "";

        allShoesCard.innerHTML += `
        <div class="rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 pb-5 ">

        <div class="relative">
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
                <h3 class="text-[16px] font-semibold">${product.name}</h3>

                <p class="font-bold text-[22px]">
                    ${product.price}
                </p>
            </div> 

           <p class="text-gray-500 mt-2 px-4">
            ${product.desc}
            </p>
 

        </a>
            <button
                class="mt-5 border rounded-full px-8 py-3 hover:bg-[#003D28] hover:text-white duration-300 cursor-pointer mx-4" onclick="addBasket('${product.id}')">
                Add to Cart
            </button>
    </div>
        </div>
       
        `;
    });

    console.log("Type:", selectedType);
    console.log("Gender:", selectedGender);
    console.log("Size:", selectedSize);
    console.log("Sort:", selectedSort);
}
async function loadGender() {

    genderDropdown.innerHTML = `
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-gender="">
            All
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-gender="Female">
            Female
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-gender="Male">
            Male
        </div>

        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-gender="Unisex">
            Unisex
        </div>
    `;

    genderDropdown.querySelectorAll("[data-gender]").forEach(item => {

        item.addEventListener("click", () => {

            selectedGender = item.dataset.gender;

            document.getElementById("genderText").textContent =
                selectedGender || "Gender";

            genderDropdown.classList.add("hidden");

            loadShoesProducts();

        });

    });

}
async function loadSizes() {

  sizeDropdown.innerHTML = `
    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="">
        All
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="36">
        36
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="37">
        37
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="38">
        38
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="39">
        39
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="40">
        40
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="41">
        41
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="42">
        42
    </div>

    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" data-size="43">
        43
    </div>
`;

    sizeDropdown.querySelectorAll("[data-size]").forEach(item => {

        item.addEventListener("click", () => {

            selectedSize = item.dataset.size;

            document.getElementById("sizeText").textContent =
                selectedSize || "Size";

            sizeDropdown.classList.add("hidden");

           loadShoesProducts();

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

            loadShoesProducts();

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
loadShoesProducts();
loadTypes();
loadGender();
loadSizes();
loadSort();
loadCategories();

function showToast(message){
    toast.textContent=message;
     toast.classList.remove("translate-x-[400px]"); 

     setTimeout(()=>{
          toast.classList.add("translate-x-[400px]");
     }, 2000)
}