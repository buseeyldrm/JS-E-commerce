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
    setDoc,
    serverTimestamp,
    query,
    orderBy
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


const paymentProducts = document.getElementById("paymentProducts");
const productCount = document.getElementById("productCount");
const basketIcon=document.getElementById("basket-icon");
const trendBy=document.getElementById("trendBy");
const categoryDropdown = document.getElementById("categoryDropdown");
const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const logoutBtn = document.getElementById("logoutBtn");
const params = new URLSearchParams(window.location.search);
const ids = params.get("ids");
const deliveryForm = document.getElementById("deliveryForm");
const deliveryInfo = document.getElementById("deliveryInfo");
const makePayment=document.getElementById("makePayment");
const paymentModal=document.getElementById("paymentModal");

const continueButton=document.getElementById("continueButton");
const saveBtn=document.getElementById("saveBtn");
const editBtn=document.getElementById("editBtn");
const total=document.getElementById("total");
 let totalPrice = 0;
 let orderNote = "";

const orderNoteButton=document.getElementById("orderNoteButton");


onAuthStateChanged(auth, (user) => {
    if (user) {
        loadPaymentProducts();
        loadDeliveryInfo();
        loadCategories();
    } else {
        window.location.href = "login.html";
    }
});


async function loadPaymentProducts() {

    if (!ids) return;

    const productIds = ids.split(",");

    paymentProducts.innerHTML = "";

    productCount.textContent = `(${productIds.length} Product)`;
   
    

    for (const id of productIds) {

        const basketSnap = await getDoc(
            doc(db, "basket", auth.currentUser.uid, "products", id)
        );

        const basketItem = basketSnap.data();

      
        const productSnap = await getDoc(
            doc(db, "products", id)
        );

        const product = productSnap.data();

  
      const settingsSnap = await getDoc(
        doc(db, "settings", "shipping")
        );

        const shippingId = settingsSnap.data().company;

        const shippingSnap = await getDoc(
            doc(db, "shipping", shippingId)
        );
        console.log(shippingSnap.exists());
        console.log(shippingSnap.data());

        const shipping = shippingSnap.data();

        const itemTotal = product.price * basketItem.quantity;
        totalPrice += itemTotal;

         const image =
            product.images?.[product.defaultImage ?? 0] ||
            product.image

        paymentProducts.innerHTML += `
            <div class="border border-gray-200 shadow-sm mb-5 p-5 bg-white">

                <div class="flex items-center gap-5">

                    <img
                        src="${image}"
                        class="w-28 h-28 object-contain">

                    <div class="flex-1">

                        <h3 class="font-semibold text-lg">
                            ${product.name}
                        </h3>
                        <span class="text-gray-500 ">${product.desc}</span>

                        <p class="text-gray-500">
                            🚚 ${shipping.name} • ${shipping.duration} business days
                        </p>

                        <p class="mt-2">
                            Quantity: ${basketItem.quantity}
                        </p>

                    </div>

                    <p class="font-bold text-[#F27A1A] text-xl">
                        ₺${product.price * basketItem.quantity}
                    </p>

                </div>

            </div>
        `;
    }
    total.textContent = `Total: ₺${totalPrice.toFixed(2)}`;
}
saveBtn.addEventListener("click", async () => {
    const name = document.getElementById("nameInput").value;
    const surname = document.getElementById("surnameInput").value;
    const address = document.getElementById("addressInput").value;
    const city = document.getElementById("cityInput").value;
    const zip = document.getElementById("zipInput").value;
    const mobile = document.getElementById("mobileInput").value;
    const email = document.getElementById("emailInput").value;

     if (!checkInfo()) return;
  
   await setDoc(
    doc(db, "customers", auth.currentUser.uid),
    {
        name,
        surname,
        email,
        mobile,
        delivery: {
            address,
            city,
            zip
        }
    },
    { merge: true }
);
     document.getElementById("showName").textContent = name;
    document.getElementById("showSurname").textContent = surname;
    document.getElementById("showAddress").textContent = address;
    document.getElementById("showCity").textContent = city;
    document.getElementById("showZip").textContent = zip;
    document.getElementById("showMobile").textContent = mobile;
    document.getElementById("showEmail").textContent = email;

    showToast("Delivery information saved successfully.");

    deliveryForm.classList.add("hidden");
    deliveryInfo.classList.remove("hidden");
    saveBtn.classList.add("hidden");
    editBtn.classList.remove("hidden")
    

});

orderNoteButton.addEventListener("click", () => {

    const note = document.getElementById("orderNote").value.trim();

    if (note === "") {
        showToast("Please enter an order note.", "error");
        return;
    }

    orderNote = note;

    showToast("Order note saved.");
});

makePayment.addEventListener("click", async () => {

    if (!checkInfo()) return;

    const name = document.getElementById("nameInput").value.trim();
    const surname = document.getElementById("surnameInput").value.trim();
    const address = document.getElementById("addressInput").value.trim();
    const city = document.getElementById("cityInput").value.trim();
    const zip = document.getElementById("zipInput").value.trim();
    const mobile = document.getElementById("mobileInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();

    if (
        !name ||
        !surname ||
        !address ||
        !city ||
        !zip ||
        !mobile ||
        !email
    ) {
        return;
    }

    const transactionId = generateTransactionId();

    const productIds = ids.split(",");
    const orderProducts = [];

    for (const id of productIds) {

        const basketSnap = await getDoc(
            doc(db, "basket", auth.currentUser.uid, "products", id)
        );

        const basketItem = basketSnap.data();

        const productSnap = await getDoc(
            doc(db, "products", id)
        );

        const product = productSnap.data();

            const image =
            product.images?.[product.defaultImage ?? 0] ||
            product.image ||
            "";

        orderProducts.push({
            id,
            name: product.name,
            image,
            price: product.price,
            quantity: basketItem.quantity
        });
    }

   const order = {
    customer: `${name} ${surname}`,
    email,
    phone: mobile,
    address: `${address}, ${city}, ${zip}`,
    date: new Date().toISOString().split("T")[0],
    price: totalPrice,
    quantity: productIds.length,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    status: "Pending",
    transactionId,
    products: orderProducts,
    createdAt: serverTimestamp(),
    orderNote: orderNote,
};


try {
    await setDoc(
        doc(db, "orders", transactionId.toString()),
        order
    );

   
} catch (error) {
    console.error("setDoc Hatası:", error);
    console.log(order);
}

for (const item of orderProducts) {

    const productRef = doc(db, "products", item.id);

    await updateDoc(productRef, {
        stock: increment(-item.quantity)
    });

    await deleteDoc(
        doc(db, "basket", auth.currentUser.uid, "products", item.id)
    );
}

    document.getElementById("transactionId").textContent = transactionId;

    paymentModal.classList.remove("hidden");

    confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
    });

});


continueButton.addEventListener("click",()=>{
    window.location.href="index.html";
})

async function loadDeliveryInfo() {

    const user = auth.currentUser;

    const snap = await getDoc(
    doc(db, "customers", auth.currentUser.uid)
);

    if (!snap.exists()) return;

    const data = snap.data();
    const delivery = data.delivery || {};

    const hasDelivery =
    delivery.address &&
    delivery.city &&
    delivery.zip;

if (!hasDelivery) {
    deliveryForm.classList.remove("hidden");
    deliveryInfo.classList.add("hidden");

    saveBtn.classList.remove("hidden");
    editBtn.classList.add("hidden");

    return;
}

    document.getElementById("nameInput").value = data.name || "";
    document.getElementById("surnameInput").value = data.surname || "";
    document.getElementById("addressInput").value = delivery.address || "";
    document.getElementById("cityInput").value = delivery.city || "";
    document.getElementById("zipInput").value = delivery.zip || "";
    document.getElementById("mobileInput").value = data.mobile || "";
    document.getElementById("emailInput").value = data.email || "";

    document.getElementById("showName").textContent = data.name || "";
    document.getElementById("showSurname").textContent = data.surname || "";
    document.getElementById("showAddress").textContent = delivery.address || "";
    document.getElementById("showCity").textContent = delivery.city || "";
    document.getElementById("showZip").textContent = delivery.zip || "";
    document.getElementById("showMobile").textContent = data.mobile || "";
    document.getElementById("showEmail").textContent = data.email || "";

    saveBtn.classList.add("hidden");
    editBtn.classList.remove("hidden");
        
    deliveryForm.classList.add("hidden");
    deliveryInfo.classList.remove("hidden");
}

editBtn.addEventListener("click",()=>{
    deliveryForm.classList.remove("hidden");
    deliveryInfo.classList.add("hidden");

    saveBtn.classList.remove("hidden");
    editBtn.classList.add("hidden")
})

function checkInfo(){
    const nameInput = document.getElementById("nameInput");
    const surnameInput = document.getElementById("surnameInput");
    const addressInput = document.getElementById("addressInput");
    const cityInput = document.getElementById("cityInput");
    const zipInput = document.getElementById("zipInput");
    const mobileInput = document.getElementById("mobileInput");
    const emailInput = document.getElementById("emailInput");

     const inputs = [
        nameInput,
        surnameInput,
        addressInput,
        cityInput,
        zipInput,
        mobileInput,
        emailInput
    ];

    inputs.forEach(clearError);

   let hasError = false;

for (const input of inputs) {
    if (input.value.trim() === "") {
        setError(input);
        hasError = true;
    }
}

if (hasError) {
    showToast("Please fill in all fields.", "error");
    return false;
}
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value)) {

        setError(emailInput);

        showToast("Invalid email address.", "error");

        return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;

    if (!phoneRegex.test(mobileInput.value)) {

        setError(mobileInput);

        showToast("Invalid phone number.", "error");

        return false;
    }

    return true;
}

function setError(input) {
    input.classList.add("border-red-500");
}

function clearError(input) {
    input.classList.remove("border-red-500");
}

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.className =
        `fixed top-5 right-5 text-white px-5 py-3 rounded-lg shadow-lg z-50 ${
            type === "success" ? "bg-green-500" : "bg-red-500"
        }`;
  

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}

function generateTransactionId() {
    return Math.floor(100000 + Math.random() * 900000);
}
basketIcon.addEventListener("click", () => {
    window.location.href = "basket.html";
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

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {
        console.log(error);
    }

});
loadCategories();