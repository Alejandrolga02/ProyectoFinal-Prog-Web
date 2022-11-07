"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import { getStorage, ref as refStorage, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";

const firebaseConfig = {
	apiKey: "AIzaSyDDG__NXwuBiuiJimbogM-FJOQVl2nJhlc",
	authDomain: "alejandrolga-webfinal.firebaseapp.com",
	projectId: "alejandrolga-webfinal",
	storageBucket: "alejandrolga-webfinal.appspot.com",
	messagingSenderId: "527030299000",
	appId: "1:527030299000:web:a1c1c54973bf2a9211008d",
	measurementId: "G-13ZX3GTW9G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage();

const products = document.querySelector("#products");

async function showProducts() {
	try {
		event.preventDefault();
		products.innerHTML = "";
		const dbref = ref(db, "productos");

		const storageRef = refStorage(storage, "imagenVacia.svg");
		let urlDefault = await getDownloadURL(storageRef);

		await onValue(dbref, snapshot => {
			snapshot.forEach(childSnapshot => {
				const childKey = childSnapshot.key;
				const childData = childSnapshot.val();
				let imgURL;

				if (childData.url === undefined) {
					imgURL = urlDefault;
				} else {
					imgURL = childData.url;
				}

				products.innerHTML += `
				<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
					<div class="card">
						<img src="${imgURL}" class="card-img-top" alt="Imagen de ${childKey}">
						<div class="card-body">
							<h5 class="card-title my-0">${childKey}</h5>
							<p class="card-text my-2">${childData.descripcion}</p>
							<b class="d-block my-0">${childData.precio}</b>
							<a href="#" class="btn btn-primary mt-2">Comprar</a>
						</div>
					</div>
				</div>`;
			});
		});

		products.classList.remove("d-none");
	} catch (error) {
		console.log(error);
	}
}

window.addEventListener("DOMContentLoaded", showProducts);
