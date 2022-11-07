"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, onValue, ref, set, child, get, update, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import {
	getStorage,
	deleteObject,
	ref as refStorage,
	uploadBytes,
	getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";

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

// Declarar elementos del DOM
const btnAgregar = document.querySelector("#btnAgregar");
const btnConsultar = document.querySelector("#btnConsultar");
const btnActualizar = document.querySelector("#btnActualizar");
const btnEliminar = document.querySelector("#btnEliminar");
const btnMostrar = document.querySelector("#btnMostrar");
const btnLimpiar = document.querySelector("#btnLimpiar");
const results = document.querySelector("#results");
const imagen = document.querySelector("#imagen");

// Variables input
const getInputs = () => {
	event.preventDefault();

	return {
		nombre: document.querySelector("#nombre").value.trim(),
		precio: document.querySelector("#precio").value.trim(),
		descripcion: document.querySelector("#descripcion").value.trim(),
	};
};

const clearInputs = () => {
	event.preventDefault();
	document.querySelector("#nombre").value = "";
	document.querySelector("#precio").value = "";
	document.querySelector("#descripcion").value = "";
	document.querySelector("#imgPreview").classList.add("d-none");
	results.classList.add("d-none");
	results.innerHTML = "";
	imagen.value = "";
};

const fillInputs = ({ nombre, descripcion, precio, url }) => {
	document.querySelector("#nombre").value = nombre;
	document.querySelector("#descripcion").value = descripcion;
	document.querySelector("#precio").value = precio.slice(1);
	document.querySelector("#imgPreview").src = url;
	document.querySelector("#imgPreview").classList.remove("d-none");
};

const imagenChange = () => {
	document.querySelector("#imgPreview").src = URL.createObjectURL(imagen.files[0]);
	document.querySelector("#imgPreview").classList.remove("d-none");
};

const showAlert = (message, title) => {
	const modalToggle = document.getElementById("alertModal");
	const myModal = new bootstrap.Modal("#alertModal", {
		keyboard: true,
	});

	document.getElementById("alertTitle").innerHTML = title;
	document.getElementById("alertMessage").innerHTML = message;

	myModal.show(modalToggle);
};

async function insertData() {
	event.preventDefault();

	try {
		let { nombre, descripcion, precio } = getInputs();
		const dbref = ref(db);
		const storageRef = refStorage(storage, "productos/" + nombre);

		if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) return showAlert("Introduzca un precio valido", "Error");
		if (!nombre || !descripcion || !imagen.value) return showAlert("Existen campos vacios", "Error");

		const snapshot = await get(child(dbref, "productos/" + nombre));
		if (snapshot.exists()) return showAlert("Ya existe un producto con ese nombre", "Error");

		await uploadBytes(storageRef, imagen.files[0]);
		let url = await getDownloadURL(storageRef);

		await set(ref(db, "productos/" + nombre), { descripcion, precio: "$" + precio, url });

		showAlert("Se insertaron con exito los datos", "Resultado");
	} catch (error) {
		console.log(error);
	}
}

async function showData() {
	event.preventDefault();

	try {
		let { nombre } = getInputs();
		if (nombre === "") return showAlert("Introduzca un nombre", "Error");

		const dbref = ref(db);
		const snapshot = await get(child(dbref, "productos/" + nombre));

		if (snapshot.exists()) {
			let descripcion = snapshot.val().descripcion;
			let precio = snapshot.val().precio;
			let url = snapshot.val().url;
			if (!url) {
				const storageRef = refStorage(storage, "imagenVacia.svg");
				url = await getDownloadURL(storageRef);
			}
			fillInputs({ nombre, descripcion, precio, url });
		} else {
			showAlert("No se encontró el registro", "Error");
		}
	} catch (error) {
		console.log(error);
	}
}

async function showProducts() {
	event.preventDefault();

	try {
		const dbref = ref(db, "productos");

		const storageRef = refStorage(storage, "imagenVacia.svg");
		let urlDefault = await getDownloadURL(storageRef);

		await onValue(dbref, snapshot => {
			results.innerHTML = `<thead><tr>
					<th scope="col" width="30%" class="text-center">Nombre</th>
					<th scope="col" width="40%" class="text-center">Descripcion</th>
					<th scope="col" width="15%" class="text-center">Precio</th>
					<th scope="col" width="15%" class="text-center">Imagen</th>
				</tr></thead><tbody></tbody>`;

			snapshot.forEach(childSnapshot => {
				const childKey = childSnapshot.key;
				const childData = childSnapshot.val();
				let imgURL;
				if (childData.url === undefined) {
					imgURL = urlDefault;
				} else {
					imgURL = childData.url;
				}
				results.lastElementChild.innerHTML += `<tr>
					<th class="text-center" scope="row">${childKey}</th>
					<td class="text-center">${childData.descripcion}</td>
					<td class="text-center">${childData.precio}</td>
					<td class="text-center p-0"><img class="w-100" src="${imgURL}" alt="Imagen de ${childKey}"/></td>
				</tr>`;
			});
		});

		results.classList.remove("d-none");
	} catch (error) {
		console.log(error);
	}
}

async function updateData() {
	event.preventDefault();

	try {
		let { nombre, descripcion, precio } = getInputs();
		const storageRef = refStorage(storage, "productos/" + nombre);

		if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) return showAlert("Introduzca un precio valido", "Error");
		if (!nombre || !descripcion) return showAlert("Existen campos vacios", "Error");

		if (!imagen.value) {
			showAlert("Se realizó una actualización", "Resultado");
			return await update(ref(db, "productos/" + nombre), { descripcion, precio: "$" + precio });
		}

		await uploadBytes(storageRef, imagen.files[0]);
		let url = await getDownloadURL(storageRef);
		await update(ref(db, "productos/" + nombre), { descripcion, precio: "$" + precio, url });
		showAlert("Se realizó una actualización", "Resultado");
	} catch (error) {
		console.log(error);
	}
}

async function deleteData() {
	event.preventDefault();

	try {
		let { nombre } = getInputs();
		if (nombre === "") return showAlert("Introduzca un nombre", "Error");

		try {
			// Create a reference to the file to delete
			const imageDelete = refStorage(storage, "productos/" + nombre);
			// Delete the file
			await deleteObject(imageDelete);
		} catch (error) {
			console.log(error);
		}

		await remove(ref(db, "productos/" + nombre));
		showAlert("Se eliminó un registro", "Error");
		await showProducts();
	} catch (error) {
		console.log(error);
	}
}

btnAgregar.addEventListener("click", insertData);
btnConsultar.addEventListener("click", showData);
btnActualizar.addEventListener("click", updateData);
btnEliminar.addEventListener("click", deleteData);
btnMostrar.addEventListener("click", showProducts);
btnLimpiar.addEventListener("click", clearInputs);
imagen.addEventListener("change", imagenChange);
