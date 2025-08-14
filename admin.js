// ✅ Configuración de Firebase ya personalizada

    // ✅ Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCozJXTEJct407_E6CpjLSK6EOZgk-W8fc",
  authDomain: "modaestil0.firebaseapp.com",
  projectId: "modaestil0",
  storageBucket: "modaestil0.appspot.com",
  messagingSenderId: "277454254263",
  appId: "1:277454254263:web:8de217a8c39e25ad1d1d32"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
 


firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("admin").style.display = "block";

    // Reiniciar botón a modo "Agregar"
    const boton = document.querySelector("#seccion-productos .btn-verde");
    if (boton) {
      boton.textContent = "Agregar producto";
      boton.onclick = agregarProducto;
    }
cargarProductos(); // ✅ Carga los productos al iniciar sesión

  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("admin").style.display = "none";
  }
});



const productosCollection = db.collection("productos");

function loginFirebase() {
  const email = document.getElementById("correo").value.trim();
  const clave = document.getElementById("clave").value.trim();

  firebase.auth().signInWithEmailAndPassword(email, clave)
    .then(() => {
      document.getElementById("login").style.display = "none";
      document.getElementById("admin").style.display = "block";
    })
    .catch(error => {
      alert("Error de acceso: " + error.message);
    });
}


const user = firebase.auth().currentUser;
if (user) {
  const nombreUsuario = document.createElement("p");
  nombreUsuario.textContent = `👋 Bienvenido, ${user.email}`;
  document.getElementById("admin").prepend(nombreUsuario);
}


function cerrarSesion() {
  firebase.auth().signOut().then(() => {
    document.getElementById("admin").style.display = "none";
    document.getElementById("login").style.display = "block";
  });
}

function mostrarSeccion(id) {
  const seccion = document.getElementById(`seccion-${id}`);
  if (!seccion) return;

  const yaActiva = seccion.classList.contains("activa");

  // Ocultar todas
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));

  // Si no estaba activa, mostrarla; si ya estaba, se oculta
  if (!yaActiva) {
    seccion.classList.add("activa");
  }
}




    function toggleConfiguracionFooter() {
      const seccion = document.getElementById("configuracion-footer");
      const btn = document.getElementById("btnToggleConfigFooter");

      const estaVisible = seccion.style.display !== "none";

      seccion.style.display = estaVisible ? "none" : "block";
      btn.textContent = estaVisible ? "⚙️ Mostrar configuración" : "🔽 Ocultar configuración";
    }

    function toggleAgregarProducto() {
      const form = document.getElementById("formAgregarProducto");
      const btn = document.getElementById("btnToggleAgregarProducto");
      const estaVisible = form.style.display !== "none";

      form.style.display = estaVisible ? "none" : "block";
      btn.textContent = estaVisible ? "➕ Mostrar formulario de producto" : "🔽 Ocultar formulario de producto";
    }

    function actualizarPreview() {
  const valor = document.getElementById('nuevoImagenes').value.trim();
  const preview = document.getElementById('preview');

  // Extrae el primer URL de imagen válido (esperando formato: color|url)
  const partes = valor.split(',');
  if (partes.length > 0) {
    const primera = partes[0].split('|')[1]?.trim();
    if (primera && primera.startsWith('http')) {
      preview.src = primera;
      return;
    }
  }

  preview.src = ''; // Limpia si no hay imagen válida
}

// ✅ Versión corregida de agregarProducto()
function agregarProducto() {
  const nombre = document.getElementById("nuevoNombre").value.trim();
  const precioOriginal = parseInt(document.getElementById("precioOriginal").value);
  const descuento = parseInt(document.getElementById("descuento").value) || 0;
  const descripcion = document.getElementById("descripcion").value.trim();
  const colorPrincipal = document.getElementById("colorPrincipal").value.trim();
  const tallas = document.getElementById("tallas").value.trim().split(",").map(t => t.trim()).filter(t => t);
  const imagenesInput = document.getElementById("imagenes").value.trim();

  const precio = Math.round(precioOriginal * (1 - descuento / 100));

  if (!nombre || isNaN(precioOriginal) || !colorPrincipal || !imagenesInput || tallas.length === 0) {
    alert("❌ Todos los campos son obligatorios.");
    return;
  }

  const imagenesPorColor = {};
  imagenesInput.split(",").forEach(url => {
    const [color, link] = url.trim().split("|");
    if (color && link) {
      imagenesPorColor[color.trim()] = link.trim();
    }
  });

  if (Object.keys(imagenesPorColor).length === 0) {
    alert("❌ Debes ingresar al menos una imagen válida en formato color|url");
    return;
  }

  const preciosPorCantidad = {};
  document.querySelectorAll("#preciosPorCantidad input").forEach(input => {
    const cantidad = input.dataset.cantidad;
    const valor = input.value.trim();
    if (valor) {
      preciosPorCantidad[cantidad] = parseInt(valor);
    }
  });

  const producto = {
    nombre,
    precio,
    precioOriginal,
    descuento,
    descripcion,
    colorPrincipal,
    imagenes: imagenesPorColor,
    tallas,
    colores: Object.keys(imagenesPorColor),
    preciosPorCantidad,
    fecha: new Date().toISOString() // ✅ AGREGADO para ordenar productos por fecha
  };

  db.collection("productos").add(producto)
    .then(() => {
      alert("✅ Producto agregado correctamente.");
      document.getElementById("nuevoNombre").value = "";
      document.getElementById("precioOriginal").value = "";
      document.getElementById("descuento").value = "";
      document.getElementById("descripcion").value = "";
      document.getElementById("colorPrincipal").value = "";
      document.getElementById("tallas").value = "";
      document.getElementById("imagenes").value = "";
      document.querySelectorAll("#preciosPorCantidad input").forEach(i => i.value = "");

      obtenerProductos();
    })
    .catch(error => {
      console.error("Error al agregar producto:", error);
      alert("❌ Ocurrió un error al agregar el producto.");
    });
}

function eliminarProductoAdmin(id) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;
  db.collection("productos").doc(id).delete()
    .then(() => {
      alert("✅ Producto eliminado correctamente");
      obtenerProductos(); // Recarga lista después de eliminar
    })
    .catch(error => {
      console.error("❌ Error al eliminar producto:", error);
      alert("Ocurrió un error al eliminar el producto.");
    });
}


function limpiarFormularioProducto() {
  document.getElementById("nuevoNombre").value = "";
  document.getElementById("nuevoPrecio").value = "";
  document.getElementById("nuevoPrecioOriginal").value = "";
  document.getElementById("nuevoImagenes").value = "";
  document.getElementById("nuevoColor").value = "";
  document.getElementById("nuevoTallas").value = "";
  document.getElementById("nuevoDescripcion").value = "";
  document.getElementById("nuevoPreciosCantidad").value = "";
  document.getElementById("preview").src = "";
}


    function cargarProductos() {
      db.collection("productos").onSnapshot(snapshot => {
        const contenedor = document.getElementById("productos");
        contenedor.innerHTML = "";

        snapshot.forEach(doc => {
          const p = doc.data();
          const div = document.createElement("div");
          div.className = "producto-item";
         div.innerHTML = `
  <strong>${p.nombre}</strong><br>
  💰 Precio: ${
  p.precio !== null
    ? `$${p.precio.toLocaleString()} - <s>$${p.precioOriginal.toLocaleString()}</s>`
    : `$${p.precioOriginal.toLocaleString()}`
}

  
  <p style="font-size: 14px; margin: 5px 0;">📝 ${p.descripcion || "Sin descripción"}</p>

  <div style="display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 5px 0;">
    🎨 ${Object.keys(p.imagenes).map(color =>
      `<div style="display: inline-block; text-align: center;">
        <img src="${p.imagenes[color]}" alt="${color}" style="height: 50px; border-radius: 6px;"><br>
        <span style="font-size: 12px;">${color}</span>
      </div>`).join('')}
  </div>

  <div style="display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 5px 0;">
    📏 ${p.tallas.map(t => `
      <span style="display: inline-block; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
        ${t}
      </span>`).join('')}
  </div>

<div class="acciones">
  <button class="btn-verde" onclick="editarProducto('${doc.id}')">✏️ Editar</button>
  <button onclick="eliminarProductoAdmin('${doc.id}')" class="btn-rojo">❌ Eliminar</button>

</div>

<p style="font-size: 13px; color: #333;">📦 Precios por cantidad:<br>
  ${p.preciosPorCantidad ? Object.entries(p.preciosPorCantidad).map(([k, v]) => `${k} par${k > 1 ? 'es' : ''}: $${v.toLocaleString()}`).join(" | ") : "Ninguno"}
</p>


`;
          contenedor.appendChild(div);
        });
      });
    }


function editarProducto(id) {
  db.collection("productos").doc(id).get().then(doc => {
    if (!doc.exists) {
      alert("❌ Producto no encontrado.");
      return;
    }

    const p = doc.data();

    // Rellenar el formulario con los datos del producto
    document.getElementById("nuevoNombre").value = p.nombre;
    document.getElementById("nuevoPrecio").value = p.precio;
    document.getElementById("nuevoPrecioOriginal").value = p.precioOriginal;
    document.getElementById("nuevoColor").value = p.color;
    document.getElementById("nuevoTallas").value = p.tallas.join(", ");
    document.getElementById("nuevoDescripcion").value = p.descripcion || "";
document.getElementById("nuevoPreciosCantidad").value = p.preciosPorCantidad
  ? Object.entries(p.preciosPorCantidad).map(([k, v]) => `${k}=${v}`).join(",")
  : "";

    // Convertir imágenes a formato editable
    const imagenesStr = Object.entries(p.imagenes).map(([color, url]) => `${color}|${url}`).join(", ");
    document.getElementById("nuevoImagenes").value = imagenesStr;
    actualizarPreview();

    // Cambiar botón a modo editar
    const boton = document.querySelector("button.btn-verde");
    boton.textContent = "💾 Guardar Cambios";
    boton.onclick = () => guardarCambiosProducto(id);
  });
}

function guardarCambiosProducto(id) {
  const nombre = document.getElementById("nuevoNombre").value.trim();
  const precio = parseFloat(document.getElementById("nuevoPrecio").value);

  const precioOriginal = parseInt(document.getElementById("nuevoPrecioOriginal").value);
  const imagenInput = document.getElementById("nuevoImagenes").value.trim();
  const color = document.getElementById("nuevoColor").value.trim().toLowerCase();
  const tallas = document.getElementById("nuevoTallas").value.split(',').map(t => t.trim()).filter(t => t !== "");
  const descripcion = document.getElementById("nuevoDescripcion").value.trim();
const preciosCantidadTexto = document.getElementById("nuevoPreciosCantidad").value.trim();
let preciosPorCantidad = {};
if (preciosCantidadTexto) {
  preciosCantidadTexto.split(',').forEach(par => {
    const [cant, valor] = par.split('=').map(s => s.trim());
    if (!isNaN(cant) && !isNaN(valor)) {
      preciosPorCantidad[cant] = parseInt(valor);
    }
  });
}

  // Validaciones
  if (!nombre || isNaN(precioOriginal) || !imagenInput || !color || tallas.length === 0 || !descripcion) {
  alert("❌ Por favor completa todos los campos obligatorios (excepto el precio con descuento).");
  return;
}


  const imagenes = {};
  const entradas = imagenInput.split(",");
  let imagenPrincipal = "";

  for (const par of entradas) {
    const [c, url] = par.split("|").map(s => s.trim().toLowerCase());
    if (c && url && url.startsWith("http")) {
      imagenes[c] = url;
      if (c === color) imagenPrincipal = url;
    }
  }

  if (!imagenPrincipal) {
    alert("❌ El color principal no tiene una imagen válida asociada.");
    return;
  }

const data = {
  nombre,
  precio: isNaN(precio) ? null : precio, // ✅ aquí es opcional
  precioOriginal,
  imagen: imagenPrincipal,
  color,
  tallas,
  imagenes,
  descripcion,
  preciosPorCantidad
};



  db.collection("productos").doc(id).set(data)
    .then(() => {
      alert("✅ Producto actualizado correctamente.");

      // Restaurar estado inicial
      document.getElementById("nuevoNombre").value = "";
      document.getElementById("nuevoPrecio").value = isNaN(precio) ? "" : precio;

      document.getElementById("nuevoPrecioOriginal").value = "";
      document.getElementById("nuevoImagenes").value = "";
      document.getElementById("nuevoColor").value = "";
      document.getElementById("nuevoTallas").value = "";
      document.getElementById("nuevoDescripcion").value = "";
      document.getElementById("nuevoPreciosCantidad").value = "";

      document.getElementById("preview").src = "";

      // Restaurar botón a modo agregar
      const boton = document.querySelector("button.btn-verde");
      boton.textContent = "Agregar Producto";
      boton.onclick = agregarProducto;
    })
    .catch(err => {
      console.error("❌ Error al actualizar producto:", err);
      alert("❌ No se pudo actualizar el producto.");
    });
}

    function guardarConfiguracion() {
      const config = {
        whatsapp: document.getElementById("configWhatsapp").value.trim(),
        whatsappPedidos: document.getElementById("configWspPedido").value.trim(),
        facebook: document.getElementById("configFacebook").value.trim(),
        instagram: document.getElementById("configInstagram").value.trim(),
        tiktok: document.getElementById("configTikTok").value.trim()
      };

      db.collection("configuracion").doc("footer").set(config)
        .then(() => {
          alert("✅ Configuración guardada correctamente.");
        })
        .catch(err => {
          console.error("Error al guardar configuración:", err);
          alert("❌ No se pudo guardar la configuración.");
        });
    }

    function cargarConfiguracion() {
      db.collection("configuracion").doc("footer").get()
        .then(doc => {
          if (doc.exists) {
            const c = doc.data();
            document.getElementById("configWhatsapp").value = c.whatsapp || "";
            document.getElementById("configWspPedido").value = c.whatsappPedidos || "";
            document.getElementById("configFacebook").value = c.facebook || "";
            document.getElementById("configInstagram").value = c.instagram || "";
            document.getElementById("configTikTok").value = c.tiktok || "";
          }
        })
        .catch(err => {
          console.warn("⚠️ No se pudo cargar la configuración:", err);
        });
    }

    function guardarMetodoPago() {
  const nombre = document.getElementById('nombreBanco').value.trim();
  const cuenta = document.getElementById('numeroCuenta').value.trim();

  if (!nombre || !cuenta) {
    alert("Completa ambos campos para guardar el método.");
    return;
  }

  db.collection("metodosPago").add({
    nombre,
    cuenta
  }).then(() => {
    document.getElementById('nombreBanco').value = "";
    document.getElementById('numeroCuenta').value = "";
    cargarMetodosPago(); // Recargar lista
  });
}

function cargarMetodosPago() {
  const lista = document.getElementById('listaMetodosPago');
  lista.innerHTML = "";

  db.collection("metodosPago").onSnapshot(snapshot => {
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const metodo = doc.data();
      const li = document.createElement("li");
      li.textContent = `${metodo.nombre} - ${metodo.cuenta}`;

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "❌";
      btnEliminar.onclick = () => eliminarMetodoPago(doc.id);

      li.appendChild(btnEliminar);
      lista.appendChild(li);
    });
  });
}

function eliminarMetodoPago(id) {
  if (confirm("¿Eliminar este método de pago?")) {
    db.collection("metodosPago").doc(id).delete();
  }
}
function guardarQuienesSomos() {
  const texto = document.getElementById("quienesSomosTexto").value.trim();

  db.collection("contenido").doc("quienesSomos").set({ texto })
    .then(() => {
      alert("✅ Texto actualizado con éxito.");
    })
    .catch(error => {
      console.error("❌ Error al guardar texto:", error);
      alert("Ocurrió un error al guardar.");
    });
}

function cargarTextoQuienesSomos() {
  const campo = document.getElementById("quienesSomosTexto");
  if (!campo) return;

  db.collection("contenido").doc("quienesSomos").get()
    .then(doc => {
      if (doc.exists) {
        campo.value = doc.data().texto || "";
      } else {
        campo.value = "";
      }
    })
    .catch(error => {
      console.error("Error al cargar texto 'Quiénes somos':", error);
    });
}

async function guardarGaleriaPorLinks() {
  try {
    const descripcion = document.getElementById("inputDescripcion").value.trim();
    const links = document.getElementById("inputLinks").value
                    .split("\n")
                    .map(l => l.trim())
                    .filter(l => l !== "");

    console.log("👤 Usuario actual:", firebase.auth().currentUser);
    console.log("📝 Descripción:", descripcion);
    console.log("🔗 Links:", links);

    if (links.length === 0) {
      alert("⚠️ Debes ingresar al menos un enlace de imagen.");
      return;
    }

    // 🔧 Guardar en Firestore
   await db.collection("galeria").doc("principal").set({
  descripcion,
  imagenes: links,
  textoPromocion: document.getElementById("textoPromocionCantidad").value.trim()
});


    console.log("✅ Documento guardado en galeria/principal");
    document.getElementById("estadoSubida").textContent = "✅ Galería guardada correctamente.";
    mostrarVistaPreviaGaleria();

  } catch (err) {
    console.error("🔥 Error al guardar galería:", err);
    alert(`❌ Error: ${err.message}`);
  }
}


function obtenerProductos() {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  db.collection("productos").orderBy("fecha", "desc").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const p = doc.data();
        const primerColor = Object.keys(p.imagenes || {})[0];
        const imagen = p.imagenes?.[primerColor] || "";

        const div = document.createElement("div");
        div.className = "producto-admin";
        div.innerHTML = `
          <img src="${imagen}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">
          <strong>${p.nombre}</strong><br>
          <span>$${p.precio?.toLocaleString()}</span>
          <button onclick="eliminarProductoAdmin('${doc.id}')" class="btn-rojo">❌ Eliminar</button>

        `;
        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error al obtener productos:", err);
    });
}

function cargarGaleriaDesdeFirestore() {
  db.collection("galeria").doc("principal").get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("inputDescripcion").value = data.descripcion || "";
        document.getElementById("textoPromocionCantidad").value = data.textoPromocion || "";
        document.getElementById("inputLinks").value = (data.imagenes || []).join("\n");
        mostrarVistaPreviaGaleria();
      }
    })
    .catch(err => {
      console.error("Error al cargar galería:", err);
    });
}


function mostrarVistaPreviaGaleria() {
  const linksTexto = document.getElementById("inputLinks").value.trim();
  const contenedor = document.getElementById("vistaGaleria");
  contenedor.innerHTML = "";
  contenedor.classList.remove("scroll-infinito");

  if (!linksTexto) return;

  const links = linksTexto.split(/\r?\n/).map(link => link.trim()).filter(link => link);

  // Duplicar imágenes para bucle infinito
  const totalLinks = links.concat(links); // duplicadas

  totalLinks.forEach(link => {
    const img = document.createElement("img");
    img.src = link;
    img.alt = "Imagen galería";
    img.style.width = "100px";
    img.style.height = "auto";
    img.style.flexShrink = "0";
    img.style.margin = "5px";
    contenedor.appendChild(img);
  });

  // Activar animación
  setTimeout(() => contenedor.classList.add("scroll-infinito"), 100);
}



// 📤 Subir imagen a Imgur (sin cuenta)
function subirImagenImgur() {
  const archivo = document.getElementById("inputImgur").files[0];
  const estado = document.getElementById("estadoImgur");
  const preview = document.getElementById("previewImgur");

  if (!archivo) {
    estado.textContent = "⚠️ Selecciona una imagen primero.";
    return;
  }

  const lector = new FileReader();
  lector.onloadend = () => {
    const base64Data = lector.result.split(",")[1]; // Elimina 'data:image/...;base64,'

    estado.textContent = "⏳ Subiendo imagen...";

    fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: "Client-ID TU_CLIENT_ID_AQUI", // 👈 Reemplaza por tu Client-ID de Imgur
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64Data,
        type: "base64"
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const url = data.data.link;
        estado.innerHTML = `
          ✅ Imagen subida:<br>
          <input type="text" value="${url}" readonly style="width: 100%; margin-top: 5px;">
          <br><small>Copia y pega: <code>color|${url}</code></small>
        `;
        preview.src = url;
        preview.style.display = "block";
      } else {
        estado.textContent = "❌ Error al subir la imagen.";
        console.error(data);
      }
    })
    .catch(err => {
      estado.textContent = "❌ Error de red o CORS.";
      console.error(err);
    });
  };

  lector.readAsDataURL(archivo); // Convierte a base64
}



  // 🧹 Limpiar campos del formulario
function limpiarCampos() {
  document.getElementById("nuevoNombre").value = "";
  document.getElementById("nuevoPrecio").value = "";
  document.getElementById("precioOriginal").value = "";
  document.getElementById("nuevoImagenes").value = "";
  document.getElementById("nuevoColor").value = "";
  document.getElementById("nuevoTallas").value = "";
  document.getElementById("nuevoDescripcion").value = "";
  document.getElementById("nuevoPreciosCantidad").value = "";
  document.getElementById("preview").src = "";
}

// 🔁 Ejecutar cuando el DOM esté listo
window.addEventListener("DOMContentLoaded", () => {
  obtenerProductos();
  cargarConfiguracion();
  cargarTextoQuienesSomos();
  cargarMetodosPago();
  cargarGaleriaDesdeFirestore(); // 👈 Agregado
});


// 🛑 Capturar errores globales en consola
window.addEventListener("error", function (e) {
  console.error("🛑 Error global detectado:", e.message);
});