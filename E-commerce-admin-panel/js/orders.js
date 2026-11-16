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
    collection,
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

const searchInput=document.getElementById("searchInput");
const filterDate=document.getElementById("filterDate");
const statusFilter=document.getElementById("statusFilter");

const deleteModal = document.getElementById("orderDeleteModal");
const cancelBtn = document.getElementById("cancelBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const datePlaceholder = document.getElementById("datePlaceholder");
let selectedOrderId = null;
const orderEditModal = document.getElementById("orderEditModal");

let orders=[];
const prevStepBtn = document.getElementById("prevStepBtn");
const nextStepBtn = document.getElementById("nextStepBtn");
const cancelOrderBtn = document.getElementById("cancelOrderBtn");
const saveOrderBtn = document.getElementById("saveOrderBtn");
const closeEditModal = document.getElementById("closeEditModal");

searchInput.addEventListener("input", filterOrders);

statusFilter.addEventListener("change", filterOrders);
const steps = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered"
];
let currentStep = 0;
const fullName = document.getElementById("fullName");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const currentStatus = document.getElementById("currentStatus");
let sortField = "";
let sortDirection = "";

const calendarIcon = document.getElementById("calendarIcon");
const clearIcon = document.getElementById("clearIcon");


document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("user");

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    loadUser();
    loadOrders();
});

function loadUser() {
    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const docSnap = await getDoc(doc(db, "users", user.uid));

        if (!docSnap.exists()) {
            await signOut(auth);
            window.location.href = "login.html";
            return;
        }

        const userData = docSnap.data();

        userName.textContent = `${userData.name} ${userData.surname}`;
        userNameFirst.textContent = userData.name.charAt(0).toUpperCase();
    });
}

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

async function loadOrders() {
    const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
);

const querySnapshot = await getDocs(q);
    orders = [];
    querySnapshot.forEach((docSnap) => {


        orders.push({
            id: docSnap.id,
            ...docSnap.data()
        });

    });
    console.log(orders);

    renderOrders(orders);

}
function renderOrders(data, reverseIndex = false) {

    productsBody.innerHTML = "";

    data.forEach((order, index) => {
        console.log(order.id, order.status);

     

        productsBody.innerHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>$${order.price}</td>
                <td>${order.quantity}</td>

                <td>
                    <span class="payment-badge ${(order.paymentStatus || "").toLowerCase()}">
                        ${order.paymentStatus}
                    </span>
                </td>

                <td>
                    <span class="status-badge ${order.status.toLowerCase()}">
                        ${order.status}
                    </span>
                </td>

                <td>
                    <div class="action-buttons">
                        <button class="detail-btn" data-id="${order.id}">
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button class="edit-btn" data-id="${order.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="delete-btn" data-id="${order.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

}
function filterOrders() {
    const search = searchInput.value.toLowerCase().trim();
    const date = filterDate.value;
    const status = statusFilter.value;

    const filteredOrders = orders.filter((order) => {

        const matchSearch =
            order.id.toLowerCase().includes(search) ||
            order.customer.toLowerCase().includes(search);

      const matchDate =
    !date || order.date === date;

        const matchStatus =
            !status || order.status === status;

        return matchSearch && matchDate && matchStatus;
    });

    renderOrders(filteredOrders);
}

cancelBtn.addEventListener("click", () => {
    deleteModal.classList.remove("show");
});

confirmDeleteBtn.addEventListener("click", async () => {
    if (!selectedOrderId) return;
    await deleteDoc(doc(db, "orders", selectedOrderId));
    deleteModal.classList.remove("show");
    selectedOrderId = null;
    loadOrders();

});

filterDate.addEventListener("change", () => {

    if (filterDate.value) {

        const [year, month, day] = filterDate.value.split("-");
        datePlaceholder.textContent = `${day}.${month}.${year}`;

        calendarIcon.style.display = "none";
        clearIcon.style.display = "block";

    } else {

        datePlaceholder.textContent = "Date Range";

        calendarIcon.style.display = "block";
        clearIcon.style.display = "none";

    }

    filterOrders();
});
document.addEventListener("click", (e) => {

    const detailBtn = e.target.closest(".detail-btn");

    if (detailBtn) {
        const orderId = detailBtn.dataset.id;
        window.location.href = `order-detail.html?id=${orderId}`;
        return;
    }

    const editBtn = e.target.closest(".edit-btn");

    if (editBtn) {
        selectedOrderId = editBtn.dataset.id;

        loadOrder(selectedOrderId);

        orderEditModal.classList.add("show");
        return;
    }

    const deleteBtn = e.target.closest(".delete-btn");

    if (deleteBtn) {
        selectedOrderId = deleteBtn.dataset.id;
        deleteModal.classList.add("show");
        return;
    }

});
async function loadOrder(id){

    const snap = await getDoc(doc(db,"orders",id));

    if(!snap.exists()) return;

    const order = snap.data();

    fullName.value = order.customer;
    phone.value = order.phone;
    address.value = order.address;

    currentStep = steps.indexOf(order.status);

    currentStatus.textContent = steps[currentStep];

    updateButtons();
}
    
function updateButtons(){
    currentStatus.textContent = steps[currentStep];
    prevStepBtn.disabled = currentStep === 0;
    nextStepBtn.disabled = currentStep === steps.length - 1;

}
prevStepBtn.addEventListener("click", () => {

    if (currentStep > 0) {
        currentStep--;
        updateButtons();
    }

});
nextStepBtn.addEventListener("click", () => {

    if (currentStep < steps.length - 1) {
        currentStep++;
        updateButtons();
    }

});
closeEditModal.addEventListener("click", () => {

    orderEditModal.classList.remove("show");

});
saveOrderBtn.addEventListener("click", async () => {

    await updateDoc(doc(db, "orders", selectedOrderId), {

        customer: fullName.value.trim(),

        phone: phone.value.trim(),

        address: address.value.trim(),

        status: steps[currentStep]

    });

    orderEditModal.classList.remove("show");

    loadOrders();

});
cancelOrderBtn.addEventListener("click", async () => {
    await updateDoc(doc(db, "orders", selectedOrderId), {
        status: "Cancelled"
    });
    orderEditModal.classList.remove("show");
    loadOrders();

});

document.querySelectorAll(".sortable").forEach(th => {

    th.addEventListener("click", () => {

        const field = th.dataset.sort;
        const icon = th.querySelector("i");

        document.querySelectorAll(".sortable i").forEach(i => {
            if (i !== icon) {
                i.classList.remove("show", "fa-sort-up", "fa-sort-down");
                i.classList.add("fa-sort");
            }
        });

        if (sortField !== field) {
            sortField = field;
            sortDirection = "asc";
        } else {
            if (sortDirection === "asc") {
                sortDirection = "desc";
            } else if (sortDirection === "desc") {
                sortDirection = "";
            } else {
                sortDirection = "asc";
            }
        }
        if (sortDirection === "") {
            icon.classList.remove("show", "fa-sort-up", "fa-sort-down");
            icon.classList.add("fa-sort");
            renderOrders(orders);
            return;
        }
        icon.classList.add("show");
        if (sortDirection === "asc") {
            icon.classList.remove("fa-sort", "fa-sort-down");
            icon.classList.add("fa-sort-up");
        } else {
            icon.classList.remove("fa-sort", "fa-sort-up");
            icon.classList.add("fa-sort-down");
        }

        if (field === "index") {
            const reversed = [...orders];
            if (sortDirection === "desc") {
                reversed.reverse();
                renderOrders(reversed, true);
            } else {
                renderOrders(reversed, false);
            }
            return;
        }

        const sorted = [...orders];
        sorted.sort((a, b) => {
            if (field === "date") {
                return sortDirection === "asc"
                    ? new Date(a.date) - new Date(b.date)
                    : new Date(b.date) - new Date(a.date);
            }
            if (field === "payment") {
                const paymentOrder = {
                    paid: 1,
                    unpaid: 2,
                    failed: 3
                    
                };

                return sortDirection === "asc"
                    ? paymentOrder[a.paymentStatus.toLowerCase()] - paymentOrder[b.paymentStatus.toLowerCase()]
                    : paymentOrder[b.paymentStatus.toLowerCase()] - paymentOrder[a.paymentStatus.toLowerCase()];

            }

            if (field === "status") {

                const statusOrder = {
                    pending: 1,
                    processing: 2,
                    shipped: 3,
                    delivered: 4,
                    cancelled: 5
                };

                return sortDirection === "asc"
                    ? statusOrder[a.status.toLowerCase()] - statusOrder[b.status.toLowerCase()]
                    : statusOrder[b.status.toLowerCase()] - statusOrder[a.status.toLowerCase()];

            }

            return sortDirection === "asc"
                ? a[field].localeCompare(b[field])
                : b[field].localeCompare(a[field]);

        });

        renderOrders(sorted);

    });

});

calendarIcon.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    filterDate.showPicker();
});
clearIcon.addEventListener("click", (e) => {
    console.log("tıklandı ı")
    e.preventDefault();
    e.stopPropagation();

    filterDate.value = "";
    filterDate.dispatchEvent(new Event("change"));
});