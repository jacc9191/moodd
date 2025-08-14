// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCdRD_7zjuRp5586wcaa2WA_ZhzecKf5jM",
  authDomain: "modaestilo-e8dec.firebaseapp.com",
  databaseURL: "https://modaestilo-e8dec-default-rtdb.firebaseio.com",
  projectId: "modaestilo-e8dec",
  storageBucket: "modaestilo-e8dec.firebasestorage.app",
  messagingSenderId: "710901651909",
  appId: "1:710901651909:web:fe0bd97a14b25e191653ac"
};

// ✅ Solo inicializa Firebase si aún no se ha hecho
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ✅ Exporta Firestore para usarlo globalmente
const db = firebase.firestore();


  db.collection("configuracion").doc("footer").get().then(doc => {
  if (doc.exists) {
    const c = doc.data();

    // Guardar el número para envíos
    window.numeroWspConfig = c.whatsapp;

    // WhatsApp del botón flotante
    const btnWsp = document.querySelector(".btn-whatsapp");
    if (btnWsp && c.whatsapp) {
      btnWsp.href = `https://wa.me/${c.whatsapp}`;
    }

    // Redes sociales
    if (c.facebook) {
      const fb = document.querySelector(".facebook-link");
      if (fb) fb.href = c.facebook;
    }
    if (c.instagram) {
      const ig = document.querySelector(".instagram-link");
      if (ig) ig.href = c.instagram;
    }
    if (c.tiktok) {
      const tt = document.querySelector(".tiktok-link");
      if (tt) tt.href = c.tiktok;
    }
  } else {
    console.warn("⚠️ No hay configuración en Firestore.");
  }
}).catch(error => {
  console.error("❌ Error cargando configuración:", error);
});


db.collection("contenido").doc("quienesSomos").get().then(doc => {
  if (doc.exists) {
    document.getElementById("contenido-quienes-somos").textContent = doc.data().texto || "";
  }
});
 

    // === main.js ===
   
// Carrito inicial
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];


function actualizarCarrito() {
  const div = document.getElementById('carrito');
  div.innerHTML = '';

  if (carrito.length === 0) {
    div.innerHTML = '<p style="text-align:center; color: #888;">🛒 El carrito está vacío</p>';
    document.getElementById('total-carrito').innerHTML = '';
    localStorage.setItem('carrito', JSON.stringify(carrito));
    return;
  }

  const conPromo = carrito.filter(p => p.preciosPorCantidad && Object.keys(p.preciosPorCantidad).length > 0);
  const sinPromo = carrito.filter(p => !p.preciosPorCantidad || Object.keys(p.preciosPorCantidad).length === 0);
  const totalPromo = conPromo.reduce((sum, p) => sum + (p.cantidad || 1), 0);

  let escalones = {};
  conPromo.forEach(p => {
    Object.entries(p.preciosPorCantidad).forEach(([cantidad, precio]) => {
      const cant = parseInt(cantidad);
      const prec = parseInt(precio);
      if (!escalones[cant] || prec < escalones[cant]) {
        escalones[cant] = prec;
      }
    });
  });

  const escalonesOrdenados = Object.keys(escalones).map(Number).sort((a, b) => a - b);
  let mejorEscalon = 1;
  escalonesOrdenados.forEach(cant => {
    if (totalPromo >= cant) mejorEscalon = cant;
  });

  if (mejorEscalon > 1) {
    const precioTotalCombo = escalones[mejorEscalon];
    const precioUnitario = Math.round(precioTotalCombo / mejorEscalon);
    conPromo.forEach(p => {
      p.precioAplicado = precioUnitario;
      p.promocionAplicada = true;
      p.escalonAplicado = mejorEscalon;
      p.comboPrecioTotal = precioTotalCombo;
    });
  } else {
    conPromo.forEach(p => {
      p.precioAplicado = p.precio;
      p.promocionAplicada = false;
    });
  }

  const carritoCompleto = [...conPromo, ...sinPromo];
  let total = 0;
  let ahorroTotal = 0;

  carritoCompleto.forEach((item, index) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'item-carrito-elegante';

    const precioOriginal = item.precioOriginal || item.precio;
    const precioFinal = item.precioAplicado || precioOriginal;
    const cantidad = item.cantidad || 1;
    const totalProducto = precioFinal * cantidad;
    const ahorro = (precioOriginal - precioFinal) * cantidad;

    total += totalProducto;
    if (ahorro > 0) ahorroTotal += ahorro;

    const textoCantidad = cantidad === 1 ? "1 par" : `${cantidad} pares`;

    tarjeta.innerHTML = `
      <div class="carrito-info">
        <div class="info-superior">
          <h4>${item.nombre} - ${textoCantidad}</h4>
        </div>
        <p>🎨 Color: <strong>${item.color}</strong></p>
        <p class="subitem-talla">
          <span>📏 Talla: <strong>${item.talla}</strong></span>
          <span class="icono-eliminar" onclick="eliminarProducto(event, ${index})">❌</span>
        </p>
      </div>
    `;

    div.appendChild(tarjeta);
  });

  // Resumen de promoción después del carrito
  let resumenPromocion = '';

  if (mejorEscalon > 1 && escalones[mejorEscalon]) {
    const comboAplicado = `<p style="color: green; font-weight: bold;">💥 Combo ${mejorEscalon}x: $${escalones[mejorEscalon].toLocaleString()}</p>`;

    const escalonesOrdenadosFiltrados = escalonesOrdenados.filter(e => e > mejorEscalon);
    const siguienteEscalon = escalonesOrdenadosFiltrados.length > 0 ? escalonesOrdenadosFiltrados[0] : null;

    const siguienteCombo = siguienteEscalon
      ? `<p style="color: #555; font-size: 0.9rem;">• Combo x ${siguienteEscalon}: $${escalones[siguienteEscalon].toLocaleString()}</p>`
      : '';

    const ahorroTexto = ahorroTotal > 0
      ? `<p style="color: green;">🎉 Ahorraste: $${ahorroTotal.toLocaleString()}</p>`
      : '';

    resumenPromocion = comboAplicado + siguienteCombo + ahorroTexto;
  }

  document.getElementById('total-carrito').innerHTML = `
    ${resumenPromocion}
    <div class="total-carrito" style="margin-top: 0.8rem;">
      🧾 <strong>Total:</strong> <span>$${total.toLocaleString()}</span>
    </div>
  `;

  localStorage.setItem('carrito', JSON.stringify(carritoCompleto));
  carrito = carritoCompleto;
  console.log("Carrito con datos completos:", carrito);
}



function agregarAlCarrito(producto, tallaSeleccionada, colorSeleccionado) {
  const productoSeleccionado = {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    precioOriginal: producto.precioOriginal || producto.precio,
    talla: tallaSeleccionada,
    color: colorSeleccionado,
    cantidad: 1,
    imagen: producto.imagen,
   preciosPorCantidad: producto.preciosPorCantidad ? { ...producto.preciosPorCantidad } : {}

  };

  // ✅ Asegúrate que preciosPorCantidad quede como números
  if (productoSeleccionado.preciosPorCantidad) {
    Object.keys(productoSeleccionado.preciosPorCantidad).forEach(key => {
      productoSeleccionado.preciosPorCantidad[key] = Number(productoSeleccionado.preciosPorCantidad[key]);
    });
  }

  carrito.push(productoSeleccionado);
  console.log("Carrito actualizado:", carrito); // para verificar en consola
  actualizarCarrito();
    mostrarNotificacion("✅ Producto agregado"); // 👈 Aquí se muestra el mensaje

}

function eliminarTalla(id, color, talla) {
  const index = carrito.findIndex(item => item.id === id && item.color === color && item.talla === talla);
  if (index !== -1) {
    carrito.splice(index, 1);
    actualizarCarrito();
  }
}


    function eliminarProducto(event, index) {
  event.stopPropagation(); // 👈 Previene que se cierre el carrito
  carrito.splice(index, 1);
  actualizarCarrito();
}

function toggleCarrito() {
  const contenedor = document.getElementById('bloqueCarrito');
  const btn = document.querySelector('.fila-carrito button');
  const estaVisible = contenedor.classList.contains('mostrar');

  if (estaVisible) {
    contenedor.classList.remove('mostrar');
    contenedor.classList.add('oculto');
    document.body.classList.remove('mostrar-carrito');
    btn.textContent = '🛒';
    btn.classList.remove('ocultar-carrito');
    btn.classList.add('ver-carrito');
  } else {
    contenedor.classList.remove('oculto'); // ✅ QUITA oculto
    contenedor.classList.add('mostrar');
    document.body.classList.add('mostrar-carrito');
    actualizarCarrito();
    btn.textContent = '🛒';
    btn.classList.remove('ver-carrito');
    btn.classList.add('ocultar-carrito');
  }
}

function mostrarFormulario() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  const formContainer = document.getElementById('formularioCliente');
  formContainer.classList.add('formulario-visible'); // ✅ NUEVA CLASE
  formContainer.scrollIntoView({ behavior: 'smooth' });
}


function ocultarFormulario() {
  const form = document.getElementById('formularioCliente');
  form.classList.remove('formulario-visible');
  form.classList.remove('oculto'); // por si quedó activa

  const carrito = document.getElementById('bloqueCarrito');
  carrito.classList.remove('oculto');

  const btn = document.querySelector('.fila-carrito button');
  if (btn) {
    btn.textContent = '🛒';
    btn.classList.remove('ver-carrito');
    btn.classList.add('ocultar-carrito');
  }
}


// Guardar nuevo contenido
function guardarQuienesSomos() {
  const nuevoTexto = document.getElementById("textarea-quienes-somos").value.trim();
  db.collection("configuracion").doc("quienesSomos").set({ contenido: nuevoTexto })
    .then(() => alert("✅ Sección 'Quiénes somos' actualizada"))
    .catch(err => alert("❌ Error al guardar: " + err.message));
}

function mostrarNotificacion(mensaje = "Producto agregado") {
  const notif = document.getElementById("notificacion");
  notif.textContent = mensaje;
  notif.classList.remove("oculto");
  notif.classList.add("mostrar");

  // 🔊 Reproducir sonido de confirmación
  const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1156-pristine.mp3');
  audio.play();

  setTimeout(() => {
    notif.classList.remove("mostrar");
    notif.classList.add("oculto");
  }, 3000);
}





    function confirmarEnvioWhatsApp() {
  const campos = {
    nombre: document.getElementById('nombreCliente').value.trim(),
    departamento: document.getElementById('departamentoCliente').value.trim(),
    ciudad: document.getElementById('ciudadCliente').value.trim(),
    direccion: document.getElementById('direccionCliente').value.trim(),
    celular: document.getElementById('celularCliente').value.trim(),
    metodo: document.getElementById('metodoPagoCliente').value
  };

  for (const [key, value] of Object.entries(campos)) {
    if (!value) {
      alert('Por favor completa todos los campos del formulario.');
      return;
    }
  }

  if (!/^\d{10}$/.test(campos.celular)) {
    alert('Por favor ingresa un número de celular válido de 10 dígitos.');
    return;
  }

  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const fecha = new Date();
  const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
  let mensaje = `📦 *NUEVO PEDIDO*\n\n🗓️ *Fecha:* ${fechaFormateada}\n\n`;

 carrito.forEach((item, i) => {
const precioFinal = item.precioAplicado || item.precio;
const totalProducto = precioFinal * item.cantidad;

mensaje += `🥿 *Producto ${i + 1}*: ${item.nombre} - Color: ${item.color} - Talla: ${item.talla} - Cantidad: ${item.cantidad} par${item.cantidad > 1 ? 'es' : ''} - Total: $${totalProducto.toLocaleString()}\n`;

});

  const total = carrito.reduce((acc, item) => {
  const precioFinal = item.precioAplicado || item.precio;
  return acc + precioFinal * item.cantidad;
}, 0);

mensaje += `\n💰 *Total:* $${total.toLocaleString()}\n\n`;
  mensaje += `📍 *Nombre:* ${campos.nombre}\n`;
  mensaje += `🏛️ *Departamento:* ${campos.departamento}\n`;
  mensaje += `🏙️ *Ciudad:* ${campos.ciudad}\n`;
  mensaje += `🏠 *Dirección:* ${campos.direccion}\n`;
  mensaje += `📞 *Celular:* ${campos.celular}\n`;
  mensaje += `💳 *Método de pago seleccionado:* ${campos.metodo}\n`;
mensaje += `\n🙌 *¡Gracias por tu compra!* Te contactaremos pronto para coordinar el envío.`;

  const numeroWhatsApp = window.numeroWspConfig || '573185634316';

  // Obtener métodos de pago desde Firebase y luego enviar mensaje
    db.collection("metodosPago").get().then(() => {
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    // Limpiar carrito y volver a inicio
    vaciarCarrito();

    // Ocultar formulario y carrito
    document.getElementById('formularioCliente').classList.add('oculto');
    document.getElementById('bloqueCarrito').classList.add('oculto');

    // Cambiar ícono del botón carrito
    const btn = document.querySelector('.fila-carrito button');
    if (btn) {
      btn.textContent = '🛒';
      btn.classList.remove('ocultar-carrito');
      btn.classList.add('ver-carrito');
    }

    // Mostrar notificación de éxito
    mostrarNotificacion("✅ Pedido enviado con éxito");

    // Desplazar al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }).catch(err => {
    console.error("❌ Error al cargar métodos de pago:", err);
    alert("Hubo un error al obtener los métodos de pago.");
  });

}

 // Descuento extra
 function iniciarDescuentoIndividual(productoNode, minutosDescuento = 10) {
  const tieneDescuentoFijo = parseInt(productoNode.getAttribute("data-descuento-fijo"));
  if (tieneDescuentoFijo > 0) {
    const mensajeDescuento = productoNode.querySelector(".descuento-tiempo");
    if (mensajeDescuento) mensajeDescuento.style.display = "none";
    return; // ⛔ No aplicar descuento por tiempo si ya hay descuento fijo
  }

  const id = productoNode.getAttribute("data-id");
  const precioTag = productoNode.querySelector(".precio-producto");
  const precioConDescuento = productoNode.querySelector(".precio-con-descuento");
  const contador = productoNode.querySelector(".contador-individual");
  const mensajeDescuento = productoNode.querySelector(".descuento-tiempo");

  const precioOriginal = parseFloat(precioTag.getAttribute("data-precio-original"));
  const precioBase = parseFloat(precioTag.getAttribute("data-precio"));

  const precioExtraDescuento = Math.round(precioBase * 0.9); // ✅ 10% extra

  let inicio = localStorage.getItem(`descuentoInicio_${id}`);
  if (!inicio) {
    inicio = new Date().getTime();
    localStorage.setItem(`descuentoInicio_${id}`, inicio);
  } else {
    inicio = parseInt(inicio);
  }

  const fin = inicio + minutosDescuento * 60 * 1000;

  const actualizarContador = () => {
    const ahora = new Date().getTime();
    const restante = fin - ahora;

    if (restante > 0) {
      const segundos = Math.floor((restante / 1000) % 60);
      const minutos = Math.floor((restante / 1000 / 60) % 60);
      const horas = Math.floor(restante / 1000 / 60 / 60);

      contador.textContent = `${horas.toString().padStart(2, "0")}:${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

      precioConDescuento.textContent = `$${precioExtraDescuento.toLocaleString()}`;
      precioTag.setAttribute("data-precio", precioExtraDescuento);
    } else {
      clearInterval(intervalo);
      contador.textContent = "00:00:00";
      precioConDescuento.textContent = `$${precioBase.toLocaleString()}`;
      precioTag.setAttribute("data-precio", precioBase);

      if (mensajeDescuento) mensajeDescuento.style.display = "none";

      let tachado = precioTag.querySelector("s");
      if (!tachado) {
        tachado = document.createElement("s");
        precioTag.insertBefore(tachado, precioConDescuento);
      }
      tachado.textContent = `$${precioOriginal.toLocaleString()}`;
    }
  };

  if (mensajeDescuento) mensajeDescuento.style.display = "block";
  actualizarContador();
  const intervalo = setInterval(actualizarContador, 1000);
}


function cargarProductosDesdeFirebase() {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "Cargando productos...";

  db.collection("productos").onSnapshot(snapshot => {
    contenedor.innerHTML = "";

    snapshot.forEach(doc => {
      const p = doc.data();
      const id = doc.id;

      // Validar campos mínimos
      if (p.precio === undefined || !p.imagenes || Object.keys(p.imagenes).length === 0) return;

      // Usar precioOriginal si existe, si no usar el precio normal
      p.precioOriginal = p.precioOriginal || p.precio;

      const porcentaje = parseInt(p.descuento) || 0;
      const precioDescuentoFijo = porcentaje > 0
        ? Math.round(p.precioOriginal * (1 - porcentaje / 100))
        : p.precio;

      const contenedorProducto = document.createElement("div");
      contenedorProducto.className = "producto";
      contenedorProducto.setAttribute("data-id", id);
      contenedorProducto.setAttribute("data-precios", JSON.stringify(p.preciosPorCantidad || {}));
      contenedorProducto.setAttribute("data-imagenes", JSON.stringify(p.imagenes || {}));
      contenedorProducto.setAttribute("data-descuento-fijo", porcentaje);

      contenedorProducto.innerHTML = `
        <div class="contenedor-img">
          <img class="main-img" src="${Object.values(p.imagenes)[0]}" alt="${p.nombre}">
        </div>

        <div class="imagenes-carrusel carrusel-scroll">
          ${Object.entries(p.imagenes).map(([color, url]) =>
            `<img src="${url}" alt="${color}" class="img-mini" data-color="${color}">`).join("")}
        </div>

    ${
  p.preciosPorCantidad && Object.keys(p.preciosPorCantidad).length > 0
    ? (() => {
        const preciosTexto = Object.entries(p.preciosPorCantidad).map(([cant, precio]) =>
          `${cant} par${cant > 1 ? 'es' : ''} - $${parseInt(precio).toLocaleString()}`
        ).join(" • ");

        const promoTexto = (window.textoPromocionCantidad || "").replace(/\n/g, " ");

        const textoFinal = `${preciosTexto} ${promoTexto}`;
         const espacios = "&nbsp;".repeat(3); // Ajusta la cantidad para más o menos espacio
         const textoExtendido = `${espacios}${textoFinal} `.repeat(3);

        return `
          <div class="carrusel-letrero">
            <div class="letrero-movimiento">
              <span>${textoExtendido}</span>
            </div>
          </div>`;
      })()
    : ""
}



        <h2>${p.nombre}</h2>

      <div class="descripcion-expandible">
          <button class="btn-ver-descripcion">Ver descripción</button>
          <p class="descripcion-texto">${p.descripcion || "Sin descripción"}</p>
        </div>


        <p class="precio-producto" data-precio="${precioDescuentoFijo}" data-precio-original="${p.precioOriginal}">
  Precio: 
  ${porcentaje > 0 ? `<s>$${parseInt(p.precioOriginal).toLocaleString()}</s>` : ''}
  <strong class="precio-con-descuento">$${precioDescuentoFijo.toLocaleString()}</strong>
</p>


        <div class="cuenta-producto descuento-tiempo" style="font-size:0.9rem; margin-top:0.5rem; color: red;">
          ⏳ Descuento 10% extra termina en: <span class="contador-individual">00:00:00</span>
        </div>

        <div class="carrusel-colores carrusel-scroll">
          ${(p.colores || Object.keys(p.imagenes)).map(color => `
            <div class="color-item">${color}</div>`).join("")}
        </div>

        <div class="carrusel-tallas carrusel-scroll">
          ${(p.tallas || []).map(talla => `
            <div class="talla-item">${talla}</div>`).join("")}
        </div>

        <button class="btn-agregar">Agregar al carrito</button>
      `;

      contenedor.appendChild(contenedorProducto);

      // Funcionalidades extra
      inicializarCarruselInteractivo(contenedorProducto);
        
      // para darle 10% de descuento extra
        //iniciarDescuentoIndividual(contenedorProducto, 10);

      // Expandir descripción
      const botonVerDescripcion = contenedorProducto.querySelector(".btn-ver-descripcion");
      const descripcionTexto = contenedorProducto.querySelector(".descripcion-texto");

      if (botonVerDescripcion && descripcionTexto) {
        botonVerDescripcion.addEventListener("click", () => {
          descripcionTexto.classList.toggle("mostrar");
          botonVerDescripcion.textContent = descripcionTexto.classList.contains("mostrar")
            ? "Ocultar descripción"
            : "Ver descripción";
        });

        if (!descripcionTexto.textContent.trim()) {
          botonVerDescripcion.style.display = "none";
        }
      }
    });

    if (contenedor.innerHTML.trim() === "") {
      contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
    }
  }, error => {
    console.error("Error cargando productos:", error);
    contenedor.innerHTML = "<p>Error al cargar productos.</p>";
  });
}



document.getElementById("buscadorProductos").addEventListener("input", function () {
  const termino = this.value.toLowerCase().trim();
  const productos = document.querySelectorAll("#contenedor-productos .producto");

  productos.forEach(producto => {
    const nombre = producto.querySelector("h2").textContent.toLowerCase();
    if (nombre.includes(termino)) {
      producto.style.display = "";
    } else {
      producto.style.display = "none";
    }
  });
});


function obtenerProductos() {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  db.collection("productos")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const producto = doc.data();
        const item = document.createElement("div");
        item.innerHTML = `
          <strong>${producto.nombre}</strong><br>
          <button onclick="eliminarProducto('${doc.id}')" class="btn-rojo">🗑️ Eliminar</button>
        `;
        contenedor.appendChild(item);
      });
    })
    .catch((error) => {
      console.error("Error al obtener productos:", error);
    });
}


function inicializarCarruselInteractivo(producto) {
  const imagenes = JSON.parse(producto.getAttribute('data-imagenes') || '{}');
  const mainImg = producto.querySelector('.main-img');
  const miniaturas = hacerCarruselInfinito(producto.querySelector('.imagenes-carrusel'), '.img-mini');
  const colores = hacerCarruselInfinito(producto.querySelector('.carrusel-colores'), '.color-item');
  const tallas = hacerCarruselInfinito(producto.querySelector('.carrusel-tallas'), '.talla-item');
  const cantidadSelect = producto.querySelector('.select-cantidad');
  const boton = producto.querySelector('.btn-agregar');
  const nombre = producto.querySelector('h2').textContent;

  let colorSeleccionado = null;
  let tallaSeleccionada = null;

  miniaturas.forEach(img => {
    img.addEventListener('click', () => {
      miniaturas.forEach(i => i.classList.remove('seleccionada'));
      img.classList.add('seleccionada');
      mainImg.setAttribute('src', img.getAttribute('src'));
      centrarElementoEnCarrusel(producto.querySelector('.imagenes-carrusel'), img);
      producto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  colores.forEach(c => {
    c.addEventListener('click', () => {
      colores.forEach(otro => otro.classList.remove('active'));
      c.classList.add('active');
      colorSeleccionado = c.textContent.trim();
      const imagenSrc = imagenes[colorSeleccionado];
      if (imagenSrc) mainImg.setAttribute('src', imagenSrc);
      mainImg.setAttribute('data-color', colorSeleccionado);
      producto.setAttribute('data-color', colorSeleccionado);
      centrarElementoEnCarrusel(producto.querySelector('.carrusel-colores'), c);
      producto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  tallas.forEach(t => {
    t.addEventListener('click', () => {
      tallas.forEach(i => i.classList.remove('active'));
      t.classList.add('active');
      tallaSeleccionada = t.textContent.trim();
      centrarElementoEnCarrusel(producto.querySelector('.carrusel-tallas'), t);
    });
  });

  boton.addEventListener('click', () => {
  if (!colorSeleccionado || !tallaSeleccionada) {
    alert("Selecciona color y talla antes de agregar al carrito.");
    return;
  }

  const productoId = producto.getAttribute("data-id");
  const imagen = mainImg.src;
  const precioBase = parseInt(producto.querySelector('.precio-producto').getAttribute("data-precio"));
  const precioOriginal = parseInt(producto.querySelector('.precio-producto').getAttribute("data-precio-original"));
  const nombre = producto.querySelector("h2").textContent;

  // ✅ Extraer preciosPorCantidad desde el atributo data-precios
  let preciosPorCantidad = null;
  const rawPrecios = producto.getAttribute("data-precios");
  if (rawPrecios) {
    try {
      preciosPorCantidad = JSON.parse(rawPrecios);
    } catch (e) {
      console.warn("❌ Error parseando preciosPorCantidad:", e);
      preciosPorCantidad = null;
    }
  }

  agregarAlCarrito({
    id: productoId,
    nombre,
    precio: precioBase,
    precioOriginal,
    imagen,
    preciosPorCantidad,
  }, tallaSeleccionada, colorSeleccionado);
});
}

    function hacerCarruselInfinito(carrusel, claseItem) {
      const originales = Array.from(carrusel.querySelectorAll(claseItem));
      const total = originales.length;
      if (total <= 1) return originales;

      // ✅ Duplica 10 veces para dar efecto de cinta
      let clones = [];
      for (let i = 0; i < 9; i++) {
        originales.forEach(item => {
          const clon = item.cloneNode(true);
          clon.classList.add("clon");
          clones.push(clon);
        });
      }

      carrusel.innerHTML = '';
      clones.forEach(n => carrusel.appendChild(n));

      // No se fuerza scrollLeft: dejamos que el usuario lo controle
      return Array.from(carrusel.querySelectorAll(claseItem));
    }


    function actualizarActivoCentral(carrusel, claseItem) {
      const items = Array.from(carrusel.querySelectorAll(claseItem));

      // Si el usuario ya seleccionó manualmente, no forzar
      const seleccionado = items.find(i => i.classList.contains("active") && !i.classList.contains("clon"));
      if (seleccionado) return;

      const centro = carrusel.scrollLeft + carrusel.offsetWidth / 2;
      let mejor = null;
      let menor = Infinity;

      items.forEach(item => {
        const centroItem = item.offsetLeft + item.offsetWidth / 2;
        const distancia = Math.abs(centro - centroItem);
        if (distancia < menor) {
          menor = distancia;
          mejor = item;
        }
      });

      if (mejor) {
        items.forEach(i => i.classList.remove("active"));
        mejor.classList.add("active");
      }
    }


    function centrarElementoEnCarrusel(carrusel, elemento) {
      const items = Array.from(carrusel.querySelectorAll(`.${elemento.classList[0]}`));

      // Buscar el clon más cercano visualmente al centro del carrusel
      const centroCarrusel = carrusel.scrollLeft + carrusel.offsetWidth / 2;

      let mejor = elemento;
      let menorDistancia = Infinity;

      items.forEach(item => {
        if (item.textContent.trim() !== elemento.textContent.trim()) return;

        const centroItem = item.offsetLeft + item.offsetWidth / 2;
        const distancia = Math.abs(centroItem - centroCarrusel);

        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          mejor = item;
        }
      });

      const carruselRect = carrusel.getBoundingClientRect();
      const elemRect = mejor.getBoundingClientRect();
      const offset = elemRect.left - carruselRect.left - carrusel.offsetWidth / 2 + elemRect.width / 2;

      carrusel.scrollTo({
        left: carrusel.scrollLeft + offset,
        behavior: 'smooth'
      });
    }

  function cargarMetodosPagoPublico() {
  const lista = document.getElementById('listaMetodosPagoPublico');
  if (!lista) return;

  db.collection("metodosPago").onSnapshot(snapshot => {
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const metodo = doc.data();
      const li = document.createElement("li");
      li.textContent = `${metodo.nombre}: ${metodo.cuenta}`;
      lista.appendChild(li);
    });
  });
}

function cargarOpcionesMetodoPago() {
  const select = document.getElementById("metodoPagoCliente");

  // Limpiar opciones anteriores (excepto la primera)
  while (select.options.length > 1) {
    select.remove(1);
  }

  db.collection("metodosPago").get().then(snapshot => {
    snapshot.forEach(doc => {
      const metodo = doc.data();
      const opcion = document.createElement("option");
      opcion.value = `${metodo.nombre} - ${metodo.cuenta}`;
      opcion.textContent = `${metodo.nombre} - ${metodo.cuenta}`;
      select.appendChild(opcion);
    });
  });
}

function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem('carrito');
  actualizarCarrito();
}


function cargarGaleriaDesdeFirebase() {
  const carrusel = document.getElementById('carruselGaleria');
  const descripcion = document.getElementById('textoGaleria');
  const textoPromoContenedor = document.getElementById("textoPromocionCantidad");


  db.collection('galeria').doc('principal').get().then(doc => {
    if (!doc.exists) return;

    const data = doc.data();
    const imagenes = data.imagenes || [];
    const descripcionTexto = data.descripcion || "";
    const textoPromocion = data.textoPromocion || "";

    // Mostrar descripción general (si la tienes en otro bloque)
    if (descripcion) {
      descripcion.textContent = descripcionTexto;
    }

    // Mostrar texto promocional dinámico en galería
    if (textoPromoContenedor) {
      textoPromoContenedor.textContent = textoPromocion;
    }

    // Guardar texto para usarlo en otro lado (por ejemplo en app.js para promociones)
    window.textoPromocionCantidad = textoPromocion;

    // Mostrar imágenes duplicadas para scroll infinito
    const imagenesDuplicadas = [...imagenes, ...imagenes];
    if (carrusel) {
      carrusel.innerHTML = imagenesDuplicadas.map(url => `
        <img src="${url}" class="miniatura" alt="galería">
      `).join('');
    }
  }).catch((error) => {
    console.error("Error al cargar galería:", error);
  });
}



  function irAInicio() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }    

  // Exponer funciones al HTML (onclick)
window.mostrarFormulario = mostrarFormulario;
window.ocultarFormulario = ocultarFormulario;
window.confirmarEnvioWhatsApp = confirmarEnvioWhatsApp;





window.addEventListener("DOMContentLoaded", async () => {
  actualizarCarrito();

  // Esperar a que se cargue primero la galería (donde viene textoPromocionCantidad)
  await cargarGaleriaDesdeFirebase();

  // Luego sí cargar productos
  cargarProductosDesdeFirebase();

  cargarMetodosPagoPublico();
  cargarOpcionesMetodoPago();



document.addEventListener("click", (event) => {
  const formulario = document.getElementById("formularioCliente");
  const contenidoFormulario = formulario?.querySelector("form");
  const carrito = document.getElementById("bloqueCarrito");
  const btnToggle = document.querySelector(".fila-carrito button");

  if (!formulario || !carrito || !btnToggle) return;

  const hizoClickEnFormulario = contenidoFormulario?.contains(event.target);
  const hizoClickEnCarrito = carrito.contains(event.target);
  const hizoClickEnBoton = btnToggle.contains(event.target);
  const hizoClickEnEliminar = event.target.classList.contains("icono-eliminar");

  // Cierra el FORMULARIO si está visible y se hace clic fuera
  if (
    formulario.classList.contains("formulario-visible") &&
    !hizoClickEnFormulario &&
    !hizoClickEnBoton &&
    !hizoClickEnCarrito
  ) {
    formulario.classList.remove("formulario-visible");
    carrito.classList.remove("oculto");
  }

  // Cierra el CARRITO si está visible y se hace clic fuera
  if (
    carrito.classList.contains("mostrar") &&
    !hizoClickEnCarrito &&
    !hizoClickEnBoton &&
    !hizoClickEnEliminar
  ) {
    carrito.classList.remove("mostrar");
    carrito.classList.add("oculto");
    btnToggle.textContent = "🛒";
    btnToggle.classList.remove("ocultar-carrito");
    btnToggle.classList.add("ver-carrito");
  }
});

});