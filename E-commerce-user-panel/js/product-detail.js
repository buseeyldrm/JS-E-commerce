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
        increment,
        setDoc
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

    const searchBox = document.getElementById("searchBox");
    const searchIcon = document.getElementById("searchIcon");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const logoutBtn = document.getElementById("logoutBtn");
    const params=new URLSearchParams(window.location.search);
    const productId=params.get("id");

    const thumbnailContainer =document.getElementById("thumbnailContainer");

    const mainImage=document.getElementById("mainImage");
    const title=document.getElementById("title");
    const desc=document.getElementById("desc");
    const price=document.getElementById("price");
    const minusBtn = document.getElementById("minusBtn");
    const plusBtn = document.getElementById("plusBtn");
    const quantity = document.getElementById("quantity");
    const addBasketBtn=document.getElementById("addBasketBtn");
    const addPaymentBtn=document.getElementById("addPaymentBtn");
    const attributesContainer = document.querySelector(".attributes");
    const shippingText=document.getElementById("shippingText");
    const titleSpecifition=document.getElementById("titleSpecifition");
    const generalInfo = document.getElementById("generalInfo");
    const productDetails = document.getElementById("productDetails");
    const toast=document.getElementById("toast");
  

    let count = 1;
    let product = null;

    async function loadProduct() {

        if (!productId) return;

        const docSnap = await getDoc(doc(db, "products", productId));

        if (!docSnap.exists()) return;

        product = docSnap.data();


        const defaultImage = product.defaultImage ?? 0;
        const image =
            product.images?.[defaultImage] ||
            product.image ||
            "";

        mainImage.src = image;

        if (product.images?.length) {
            renderThumbnails(defaultImage);
        } else {
            thumbnailContainer.innerHTML = "";
        }

        title.textContent = product.name;
        desc.textContent = product.desc;


        const currencyDoc = await getDoc(doc(db, "settings", "currency"));
        const selectedCurrency = currencyDoc.data().currency;

        //const rates = await getRates();

        let productPrice = product.price;
        let symbol = "₺";

         if (product.price >= 1000) {
        shippingText.textContent = "Free Delivery";
        shippingText.classList.add("text-green-600");

        } else {
        shippingText.textContent = "Shipping: ₺59";
        shippingText.classList.remove("text-green-600");
        }

        const usdPrice = product.price / rates.TRY;

        if (selectedCurrency === "USD") {
            productPrice = usdPrice.toFixed(2);
            symbol = "$";
        } else if (selectedCurrency === "EUR") {
            productPrice = (usdPrice * rates.EUR).toFixed(2);
            symbol = "€";
        } else if (selectedCurrency === "GBP") {
            productPrice = (usdPrice * rates.GBP).toFixed(2);
            symbol = "£";
        }

        price.textContent = `${productPrice} ${symbol}`;

        renderAttributes(product.attributes);
        renderProductDetails(product, productPrice, symbol);
    }
    function renderThumbnails(activeIndex) {

        thumbnailContainer.innerHTML = "";

        if (!product.images?.length) return;

        product.images.forEach((image, index) => {

            thumbnailContainer.innerHTML += `
                <div
                    class="thumbnail w-28 flex justify-center h-25 bg-white rounded-xl border cursor-pointer p-2
                    ${index === activeIndex ? "border-[#053D2E]" : "border-gray-200"}"
                    onclick="changeImage(${index})">

                    <img
                        src="${image}"
                        class="w-full h-full object-contain">
                </div>
            `;
        });
    }
    window.changeImage = function(index) {

        mainImage.src = product.images[index];

        document.querySelectorAll(".thumbnail").forEach((item, i) => {

            if (i === index) {
                item.classList.remove("border-gray-200");
                item.classList.add("border-[#053D2E]");
            } else {
                item.classList.remove("border-[#053D2E]");
                item.classList.add("border-gray-200");
            }

        });

    };
    async function getRates() {
        try {
            const response = await fetch(
                "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_YSJMuZ9CYQJBqcARbc91DOUmFtdAdVoKvhWlSphe"
            );

            const data = await response.json();
            return data.data;

        } catch (err) {
            console.error(err);
            return null;
        }
    }
    plusBtn.addEventListener("click", () => {
        count++;
        quantity.textContent = count;
    });

    minusBtn.addEventListener("click", () => {
        if (count > 1) {
            count--;
            quantity.textContent = count;
        }
    });
    async function addBasket() {

        const user = auth.currentUser;

        if (!user) {
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

        if (basketSnap.exists()) {

            await updateDoc(basketRef, {
                quantity: increment(count)
            });

        } else {

            await setDoc(basketRef, {
                quantity: count,
                addedAt: Date.now()
            });

        }

        const basketSnapshot = await getDocs(
            collection(db, "basket", user.uid, "products")
        );

        basketCount.textContent = basketSnapshot.size;
        basketCount.classList.remove("hidden");
    }
 
    addBasketBtn.addEventListener("click",async()=>{
        await addBasket();
        console.log("tıklandı")
        showToast("Product added to basket");
    })

    addPaymentBtn.addEventListener("click",async()=>{
        await addBasket();
        showToast("Paymet process started");
       
    setTimeout(() => {
        window.location.href = `payment.html?ids=${productId}`;
    }, 1500);
    })

    loadProduct();

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

    basketIcon.addEventListener("click",()=>{
    window.location.href="basket.html";
   
})
function renderAttributes(attributes) {

    attributesContainer.innerHTML = "";

    if (!attributes) return;

    for (const [key, values] of Object.entries(attributes)) {

        const list = Array.isArray(values) ? values : [values];

        attributesContainer.innerHTML += `
            <div class="mt-5">
                <p class="font-semibold mb-2 text-[20px] text-[#484848]">
        ${key.charAt(0).toUpperCase() + key.slice(1)}
    </p>

                <div class="flex gap-3 flex-wrap">
                    ${list.map(value => `
                        <button
                            class="attribute-btn px-6 py-2 border border-gray-300 rounded-xl hover:border-[#053D2E] hover:bg-[#053D2E] hover:text-white transition w-[150px]"
                            data-group="${key}"
                            data-value="${value}">
                            ${value}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

   
}
function renderProductDetails(product,productPrice,symbol){

    titleSpecifition.textContent=`${product.name} Full Specifition`
 
    generalInfo.innerHTML = "";
    productDetails.innerHTML="";

    const generalRows = [
    ["Name", product.name],
    ["Description", product.desc],
    ["Price", `${productPrice} ${symbol}`]
];
    
  generalRows.forEach(([label, value], index) => {

    const rowClass = index % 2 === 0 ? "bg-white" : "bg-[#F8F9FA]";

    generalInfo.innerHTML += `
        <tr class="${rowClass} rounded-sm">
            <td class="font-semibold py-3 px-4 w-48">
                ${label}
            </td>

            <td class="py-3 px-4">
                ${value}
            </td>
        </tr>
    `;
});
        if (!product.attributes) return;

        for (const [index,[key, value] ]of Object.entries(product.attributes).entries()) {
            const rowClass = index % 2 === 0 ? "bg-white" : "bg-[#F8F9FA]";

        const text = Array.isArray(value)
        ? value.map(item => `
            <span class="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                ${item}
            </span>
        `).join("")
        : value;

           productDetails.innerHTML += `
            <tr class="${rowClass}">
            <td class=" font-semibold py-3 px-4 w-48">
                ${key.charAt(0).toUpperCase() + key.slice(1)}
            </td>

            <td class="py-3 px-4">
                ${text}
            </td>
        </tr>
        `;
    }
}

function showToast(message){
    toast.textContent=message;
     toast.classList.remove("translate-x-[400px]");

    setTimeout(()=>{
          toast.classList.add("translate-x-[400px]");
    }, 2000)
}