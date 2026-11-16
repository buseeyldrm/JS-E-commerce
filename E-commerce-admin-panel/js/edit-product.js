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
    addDoc,
    getDoc,
    getDocs,
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
const productsBody=document.getElementById("productsBody");
const saveBtn=document.querySelector(".save-btn");

const form = document.getElementById("updateProductForm");
const productName = document.getElementById("productName");
const vat = document.getElementById("vat");
const category = document.getElementById("category");
const stock = document.getElementById("stock");
const price = document.getElementById("price");
const status = document.getElementById("status");

const toastSucces = document.getElementById("toastSucces");
const toastError=document.getElementById("toastError");
const leftIcon=document.querySelector(".fa-circle-left");
const productImage=document.getElementById("productImage");

const loader = document.querySelector(".loader");
const dynamicAttributes = document.getElementById("dynamicAttributes");
let images = [];
let defaultImage = 0;
const imageContainer = document.getElementById("imageContainer");
const productDesc=document.getElementById("productDesc");


let isSubmitting = false;

productImage.addEventListener("change", () => {

    const file = productImage.files[0];

    if (!file) return;

    if (images.length >= 6) {
        alert("Maximum 6 images");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        images.push(reader.result);
        renderImages();
    };

    reader.readAsDataURL(file);

    productImage.value = "";
});

leftIcon.addEventListener("click",()=>{
  window.location.href="dashboard.html";
  
})

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
function renderImages() {
    imageContainer.innerHTML = "";

    images.forEach((img, index) => {

        const box = document.createElement("div");
        box.className = "image-box-wrapper";

        box.innerHTML = `
            <label class="image-box ${index === defaultImage ? "default" : ""}">
                <img src="${img}">
                ${index === defaultImage ? '<span class="default-tag">Default</span>' : ""}
            </label>

            <button class="delete-image">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        const label = box.querySelector(".image-box");

        label.onclick = () => {
            defaultImage = index;
            renderImages();
        };

        box.querySelector(".delete-image").onclick = (e) => {

            e.stopPropagation();

            images.splice(index, 1);

            if (defaultImage >= images.length) {
                defaultImage = 0;
            }

            renderImages();

        };

        imageContainer.appendChild(box);

    });

    if (images.length < 6) {

        const add = document.createElement("label");
        add.className = "image-box add-image";

        add.innerHTML = `
            <input type="file" hidden accept="image/*">
            <i class="fa-solid fa-plus"></i>
        `;

        add.querySelector("input").addEventListener("change", (e) => {

            const file = e.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {
                images.push(reader.result);
                renderImages();
            };

            reader.readAsDataURL(file);

        });

        imageContainer.appendChild(add);
    }
}
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


document.addEventListener("DOMContentLoaded", async () => {
  const user = localStorage.getItem("user");

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadUser();

  if (productId) {
    await loadCategories();
    await loadProduct();
}
});

async function loadProduct() {
 const docSnap = await getDoc(
  doc(db, "products", productId)
);

  if (!docSnap.exists()) return;

  const product = docSnap.data();
  console.log(product)

 productName.value = product.name;
 productDesc.value = product.desc || "";
 


const querySnapshot = await getDocs(collection(db, "categories"));

querySnapshot.forEach((categoryDoc) => {
    const data = categoryDoc.data();

    if (data.route === product.category) {
        category.value = categoryDoc.id;
    }
});
category.dispatchEvent(new Event("change"));

vat.value = product.vat;
stock.value = product.stock;
price.value = product.price;
status.value = product.status;
images = product.images || [];
defaultImage = product.defaultImage || 0;


renderImages();


}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (
    !productName.value.trim() ||
    !vat.value ||
    !category.value ||
    !stock.value ||
    !price.value ||
    !status.value ||
     !productDesc.value.trim() 
  ) {
    toastError.textContent = "Please fill in all fields.";
    toastError.classList.add("show");

    setTimeout(() => {
      toastError.classList.remove("show");
    }, 2000);

    return;
  }
  const dynamicSelects = dynamicAttributes.querySelectorAll("select");

for (const select of dynamicSelects) {
    if (!select.value) {
        toastError.textContent = "Please select all product attributes.";
        toastError.classList.add("show");

        setTimeout(() => {
            toastError.classList.remove("show");
        }, 2000);

        return;
    }
}


  if (Number(stock.value) < 0) {
    toastError.textContent = "Stock cannot be negative.";
    toastError.classList.add("show");

    setTimeout(() => {
      toastError.classList.remove("show");
    }, 2000);

    return;
  }


  if (Number(price.value) <= 0) {
    toastError.textContent = "Price must be greater than 0.";
    toastError.classList.add("show");

    setTimeout(() => {
      toastError.classList.remove("show");
    }, 2000);

    return;
  }

const categoryDoc = await getDoc(doc(db, "categories", category.value));

const categoryData = categoryDoc.data();

 const product = {
    name: productName.value.trim(),
    desc: productDesc.value.trim(),
    category: categoryData.name,
    vat: vat.value,
    categoryId: category.value,
    stock: Number(stock.value),
    price: Number(price.value),
    status: status.value,
    images,
    defaultImage,
    
};

console.log(product);

  isSubmitting = true;
    saveBtn.disabled = true;
    loader.classList.add("show");

    console.log(product);
   
  try {
    await updateDoc(
      doc(db, "products", productId),
      product
    );
    loader.classList.remove("show");
  saveBtn.disabled = false;
    toastSucces.textContent =
      "The product has been successfully updated.";
    toastSucces.classList.add("show");

    setTimeout(() => {
      toastSucces.classList.remove("show");
      window.location.href = "dashboard.html";
    }, 2000);

  } catch (error) {
    console.log(error);
     isSubmitting = false;
        saveBtn.disabled = false;
        loader.classList.remove("show");
    toastError.textContent =
      "The product could not be updated.";
    toastError.classList.add("show");

    setTimeout(() => {
      toastError.classList.remove("show");
    }, 2000);
  }
});
async function loadCategories(){
  const querySnapshot=await getDocs(collection(db,"categories"));
  category.innerHTML=`<option value="">Select</option>`;

  querySnapshot.forEach((docSnap)=>{
    const data=docSnap.data();

    const option=document.createElement("option");
    option.value = docSnap.id;
    option.textContent = data.name;

    category.appendChild(option);
  })
}

category.addEventListener("change", async () => {

    console.log("Seçilen kategori:", category.value);

    dynamicAttributes.innerHTML = "";

    if (!category.value) return;

    const querySnapshot = await getDocs(
        collection(db, "categories", category.value, "attributes")
    );

    console.log("Attribute sayısı:", querySnapshot.size);

    querySnapshot.forEach(async(docSnap) => {
       const attribute = docSnap.data();

        const wrapper = document.createElement("div");
        wrapper.className = "input-group";

        const label = document.createElement("label");
        label.textContent = attribute.name;

        const select = document.createElement("select");
        select.id = docSnap.id;
        select.name = docSnap.id;

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Select";

        select.appendChild(option);

        wrapper.appendChild(label);
        wrapper.appendChild(select);

        dynamicAttributes.appendChild(wrapper);

        const optionSnapshot = await getDocs(
        collection(
            db,
            "categories",
            category.value,
            "attributes",
            docSnap.id,
            "options"
        )
    );

    optionSnapshot.forEach((optionDoc) => {
        const optionData = optionDoc.data();

        const option = document.createElement("option");
        option.value = optionDoc.id;
        option.textContent = optionData.value;

        select.appendChild(option);
    });
    });

});