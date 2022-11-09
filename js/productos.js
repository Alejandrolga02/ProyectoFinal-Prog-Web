"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import { getStorage, ref as refStorage, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";

import { firebaseConfig } from "./config.js";

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
				const childData = childSnapshot.val();

				if (childData.status === "0") {
					let imgURL = childData.url;

					if (childData.url === undefined) imgURL = urlDefault;

					products.innerHTML += `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
						<div class="card">
							<img src="${imgURL}" class="card-img-top" alt="Imagen de ${childData.nombre}">
							<div class="card-body">
								<h5 class="card-title my-0">${childData.nombre}</h5>
								<p class="card-text my-2">${childData.descripcion}</p>
								<b class="d-block my-0">${childData.precio}</b>
							</div>
							<div class="card-footer text-end">
								<a href="#" class="btn btn-primary">Comprar</a>
							</div>
						</div>
					</div>`;
				}
			});
		});

		products.classList.remove("d-none");
	} catch (error) {
		console.error(error);
	}
}

window.addEventListener("DOMContentLoaded", showProducts);
