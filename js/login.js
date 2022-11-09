import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);

// Autentificación
async function iniciarSesion() {
	try {
		event.preventDefault();
		let user = document.querySelector("#email").value;
		let pass = document.querySelector("#password").value;

		if (!user || !pass) return showAlert("Existen campos vacios", "Error");

		const auth = getAuth();
		await signInWithEmailAndPassword(auth, user, pass);

		// Signed in
		showAlert("Inicio de sesión exitoso", "Bienvenido", true);
	} catch (error) {
		showAlert("Usuario y/o contraseña incorrectas", "Error");
	}
}

function showAlert(message, title, auth = false) {
	const modalToggle = document.getElementById("alertModal");
	const myModal = new bootstrap.Modal("#alertModal", { keyboard: false });

	document.getElementById("alertTitle").innerHTML = title;
	document.getElementById("alertMessage").innerHTML = message;

	if (auth === true) {
		document.getElementById("options").innerHTML = `<a class="btn btn-success" href="admin.html">Continuar</a>`;
		document.getElementById("btnClose").innerHTML = `<a class="btn-close" href="admin.html"></a>`;
	} else {
		document.getElementById("options").innerHTML = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`;
	}
	myModal.show(modalToggle);
}

const btnLogin = document.querySelector("#login");

btnLogin.addEventListener("click", iniciarSesion);
