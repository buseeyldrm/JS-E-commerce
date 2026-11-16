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
     updateDoc
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
const leftIcon=document.querySelector(".fa-circle-left");

 const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

const nextStepBtn=document.getElementById("nextStepBtn");
const cancelOrderBtn=document.getElementById("cancelOrderBtn");
const orderToast = document.getElementById("orderToast");

const stepReceived=document.getElementById("step-received");
const stepPreparing=document.getElementById("step-preparing");
const stepShipping=document.getElementById("step-shipping");
const stepDelivered=document.getElementById("step-delivered");
const prevStepBtn = document.getElementById("prevStepBtn");
const orderNumber = document.getElementById("orderNumber");
const orderDate = document.getElementById("orderDate");


const cardType = document.getElementById("cardType");
const cardNumber = document.getElementById("cardNumber");
const cardHolder = document.getElementById("cardHolder");

const customerName = document.getElementById("customerName");
const customerOrderCount = document.getElementById("customerOrderCount");

const country = document.getElementById("country");
const city = document.getElementById("city");
const address = document.getElementById("address");

const productsList = document.getElementById("productsList");

const line1=document.getElementById("line1");
const line2=document.getElementById("line2");
const line3=document.getElementById("line3");
const subtotal = document.getElementById("subtotal");
const orderNote = document.getElementById("orderNote");
const mapFrame =document.getElementById("mapFrame");

const paymentStatus = document.getElementById("paymentStatus");
const paymentText = document.getElementById("paymentText");
const paymentIcon = document.getElementById("paymentIcon");

const shippingCustomer = document.getElementById("shippingCustomer");
const shippingEmail = document.getElementById("shippingEmail");
const shippingPhone = document.getElementById("shippingPhone");
const paymentMethod = document.getElementById("paymentMethod");

const statusMessages = {
    Pending: "Order received.",
    Processing: "Order is now being prepared.",
    Shipped: "Order has been shipped.",
    Delivered: "Order has been delivered."
};

const statusList=[
    "Pending",
    "Processing",
    "Shipped",
    "Delivered"
];

let currentStatus="Pending";

leftIcon.addEventListener("click",()=>{
  window.location.href="order.html";
  
})

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
         window.location.href = "login.html";
        return;
    }
    loadUser();
    loadOrder();
  
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

    orderToast.textContent = message;

    orderToast.classList.remove("success", "error");

    orderToast.classList.add(type);
    orderToast.classList.add("show");

    setTimeout(() => {
        orderToast.classList.remove("show");
    }, 2000);
}
function updateSteps(status){

    document.querySelectorAll(".step").forEach(step=>{
        step.classList.remove("active");
    });

    document.querySelectorAll(".line").forEach(line=>{
        line.classList.remove("active");
    });

    if(status==="Pending"){
        stepReceived.classList.add("active");
    }

    if(status==="Processing"){
        stepReceived.classList.add("active");
        stepPreparing.classList.add("active");
        line1.classList.add("active");
    }

    if(status==="Shipped"){
        stepReceived.classList.add("active");
        stepPreparing.classList.add("active");
        stepShipping.classList.add("active");
        line1.classList.add("active");
        line2.classList.add("active");
    }

    if(status==="Delivered"){
        stepReceived.classList.add("active");
        stepPreparing.classList.add("active");
        stepShipping.classList.add("active");
        stepDelivered.classList.add("active");
        line1.classList.add("active");
        line2.classList.add("active");
        line3.classList.add("active");

    }
     const index = statusList.indexOf(status);

    prevStepBtn.disabled = index === 0;
    nextStepBtn.disabled = index === statusList.length - 1;

}
async function loadOrder() {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) return;
    const order = snap.data();
    const ordersSnap = await getDocs(collection(db, "orders"));
    let totalOrders = 0;
    ordersSnap.forEach((docSnap) => {
        if (docSnap.data().customer === order.customer) {
            totalOrders++;
        }
    });
    productsList.innerHTML = "";


    let totalPrice = 0;
let totalQuantity = 0;

for (const item of order.products) {

    totalPrice += item.price * item.quantity;
    totalQuantity += item.quantity;

    productsList.innerHTML += `
        <div class="product-item">

            <div class="product-item-info">
                <img src="${item.image}" alt="${item.name}">

                <div>
                    <h4>${item.name}</h4>
                    <p>Quantity : ${item.quantity}</p>
                </div>
            </div>

            <h4 class="product-price">$${item.price}</h4>

        </div>
    `;
}
    
    orderNumber.textContent = `Order #${order.transactionId}`;
    orderDate.textContent = `Order Date : ${order.date}`;
    paymentStatus.textContent = order.paymentStatus;
    orderNote.textContent = order.orderNote || "-";;
    customerName.textContent = order.customer;

  customerOrderCount.textContent = `Total: ${totalOrders} Order`;

    subtotal.textContent = `${totalQuantity} Items · ₺${totalPrice}`;
//    cardType.textContent = order.payment;

    paymentText.textContent = order.paymentStatus;
    paymentMethod.textContent=order.paymentMethod;
   


    if ( order.paymentStatus=="Paid") {

         paymentStatus.classList.add("paid");
        paymentStatus.classList.remove("failed");

        paymentIcon.className = "fa-solid fa-circle-check";

    }
    else{
        paymentStatus.classList.add("failed");
        paymentStatus.classList.remove("paid");
        paymentIcon.className = "fa-solid fa-circle-xmark";
    }
        currentStatus = order.status;
        updateSteps(currentStatus);
        address.textContent = order.address;
        shippingCustomer.textContent = order.customer;
        shippingPhone.textContent = order.phone;
        shippingEmail.textContent = order.email;

        mapFrame.src =
            `https://www.google.com/maps?q=${encodeURIComponent(order.address)}&output=embed`;
    }
    nextStepBtn.addEventListener("click",async()=>{
        const index=statusList.indexOf(currentStatus);
        currentStatus=statusList[index+1];
        await updateDoc(doc(db,"orders",orderId),{
            status:currentStatus
        });

        updateSteps(currentStatus);
    showToast(statusMessages[currentStatus], "success");
    });

    cancelOrderBtn.addEventListener("click",async()=>{
        await updateDoc(doc(db,"orders",orderId),{
            status:"Failed"
        });
        currentStatus="Failed";
        showToast("Order cancelled.","success");
        setTimeout(()=>{
            window.location.href="order.html";
        },1000);

    });

    prevStepBtn.addEventListener("click", async () => {
        const index = statusList.indexOf(currentStatus);
        if (index === 0) {
            showToast("Order is already at the first step.", "error");
            return; 
        }
        currentStatus = statusList[index - 1];
        await updateDoc(doc(db, "orders", orderId), {
            status: currentStatus
        });
        updateSteps(currentStatus);

        showToast("Order status updated.", "success");

    });