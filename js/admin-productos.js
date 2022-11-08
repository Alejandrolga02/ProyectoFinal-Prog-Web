"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, onValue, ref, set, child, get, update } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import { getStorage, ref as refStorage, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";

import { firebaseConfig } from "./config.js";

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
		codigo: document.querySelector("#codigo").value.trim(),
		nombre: document.querySelector("#nombre").value.trim(),
		precio: document.querySelector("#precio").value.trim(),
		descripcion: document.querySelector("#descripcion").value.trim(),
	};
};

const clearInputs = () => {
	event.preventDefault();
	document.querySelector("#codigo").value = "";
	document.querySelector("#nombre").value = "";
	document.querySelector("#precio").value = "";
	document.querySelector("#descripcion").value = "";
	document.querySelector("#url").value = "";
	document.querySelector("#imgPreview").classList.add("d-none");
	results.classList.add("d-none");
	results.innerHTML = "";
	imagen.value = "";
};

const fillInputs = ({ codigo, nombre, descripcion, precio, url }) => {
	document.querySelector("#codigo").value = codigo;
	document.querySelector("#nombre").value = nombre;
	document.querySelector("#descripcion").value = descripcion;
	document.querySelector("#precio").value = precio.slice(1);
	document.querySelector("#url").value = url;
	document.querySelector("#imgPreview").src = url;
	document.querySelector("#imgPreview").classList.remove("d-none");
};

const imagenChange = () => {
	document.querySelector("#imgPreview").src = URL.createObjectURL(imagen.files[0]);
	document.querySelector("#imgPreview").classList.remove("d-none");
};

const showAlert = (message, title) => {
	const modalToggle = document.getElementById("alertModal");
	const myModal = new bootstrap.Modal("#alertModal", { keyboard: true });

	document.getElementById("alertTitle").innerHTML = title;
	document.getElementById("alertMessage").innerHTML = message;

	myModal.show(modalToggle);
};

async function insertData() {
	try {
		event.preventDefault();

		let { codigo, nombre, descripcion, precio } = getInputs();
		const dbref = ref(db);
		const storageRef = refStorage(storage, "productos/" + codigo);

		if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) return showAlert("Introduzca un precio valido", "Error");
		if (!codigo || !nombre || !descripcion || !imagen.value) return showAlert("Existen campos vacios", "Error");

		const snapshot = await get(child(dbref, "productos/" + codigo));
		if (snapshot.exists()) return showAlert("Ya existe un producto con ese código", "Error");

		await uploadBytes(storageRef, imagen.files[0]);
		let url = await getDownloadURL(storageRef);

		await set(ref(db, "productos/" + codigo), { nombre, descripcion, precio: "$" + precio, url, status: "0" });

		showAlert("Se insertaron con exito los datos", "Resultado");
	} catch (error) {
		console.error(error);
	}
}

async function showData() {
	try {
		event.preventDefault();

		let { codigo } = getInputs();
		if (codigo === "") return showAlert("Introduzca un código", "Error");

		const dbref = ref(db);
		const snapshot = await get(child(dbref, "productos/" + codigo));

		if (snapshot.exists()) {
			let nombre = snapshot.val().nombre;
			let descripcion = snapshot.val().descripcion;
			let precio = snapshot.val().precio;
			let url = snapshot.val().url;

			if (!url) url = await getDownloadURL(refStorage(storage, "imagenVacia.svg"));

			fillInputs({ codigo, nombre, descripcion, precio, url });
		} else {
			showAlert("No se encontró el registro", "Error");
		}
	} catch (error) {
		console.error(error);
	}
}

async function showProducts() {
	event.preventDefault();

	try {
		const dbref = ref(db, "productos");

		const storageRef = refStorage(storage, "imagenVacia.svg");
		let urlDefault = await getDownloadURL(storageRef);

		await onValue(dbref, snapshot => {
			results.innerHTML = `<caption>Lista de productos</caption><thead><tr>
					<th scope="col" width="5%" class="text-center">Código</th>
					<th scope="col" width="30%" class="text-center">Nombre</th>
					<th scope="col" width="35%" class="text-center">Descripción</th>
					<th scope="col" width="15%" class="text-center">Precio</th>
					<th scope="col" width="15%" class="text-center">Imagen</th>
				</tr></thead><tbody></tbody>`;

			snapshot.forEach(childSnapshot => {
				const childKey = childSnapshot.key;
				const childData = childSnapshot.val();

				if (childData.status === "0") {
					let imgURL = childData.url;

					if (childData.url === undefined) imgURL = urlDefault;

					results.lastElementChild.innerHTML += `<tr>
						<th class="text-center" scope="row">${childKey}</th>
						<td class="text-center">${childData.nombre}</td>
						<td class="text-center">${childData.descripcion}</td>
						<td class="text-center">${childData.precio}</td>
						<td class="text-center p-0"><img class="w-100" src="${imgURL}" alt="Imagen de ${childData.nombre}"/></td>
					</tr>`;
				}
			});
		});

		results.classList.remove("d-none");
	} catch (error) {
		console.error(error);
	}
}

async function updateData() {
	try {
		event.preventDefault();

		let { codigo, nombre, descripcion, precio } = getInputs();
		const storageRef = refStorage(storage, "productos/" + codigo);

		if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) return showAlert("Introduzca un precio valido", "Error");
		if (!codigo || !nombre || !descripcion) return showAlert("Existen campos vacios", "Error");

		if (!imagen.value) {
			await update(ref(db, "productos/" + codigo), { nombre, descripcion, precio: "$" + precio, status: "0" });
			return showAlert("Se realizó una actualización", "Resultado");
		}

		await uploadBytes(storageRef, imagen.files[0]);
		let url = await getDownloadURL(storageRef);

		await update(ref(db, "productos/" + codigo), { nombre, descripcion, precio: "$" + precio, url, status: "0" });
		return showAlert("Se realizó una actualización", "Resultado");
	} catch (error) {
		console.error(error);
	}
}

async function deleteData() {
	try {
		event.preventDefault();

		let { codigo } = getInputs();
		if (codigo === "") return showAlert("Introduzca un código", "Error");

		await update(ref(db, "productos/" + codigo), { status: "1" });
		showAlert("El registro fue deshabilitado", "Resultado");

		await showProducts();
	} catch (error) {
		console.error(error);
	}
}

btnAgregar.addEventListener("click", insertData);
btnConsultar.addEventListener("click", showData);
btnActualizar.addEventListener("click", updateData);
btnEliminar.addEventListener("click", deleteData);
btnMostrar.addEventListener("click", showProducts);
btnLimpiar.addEventListener("click", clearInputs);
imagen.addEventListener("change", imagenChange);
