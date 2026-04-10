// ── Estado del carrito: objeto { nombre -> { precio, cantidad, li } } ──
const carrito = {};

// ── Variables globales ──
let cantidadItems  = 0;   // total de unidades en el carrito
let totalAcumulado = 0;

// ── Selección de elementos del DOM ──
const listaCarrito = document.querySelector('#lista-carrito');
const spanTotal    = document.querySelector('#total');
const badge        = document.querySelector('#badge');
const btnVaciar    = document.querySelector('#btn-vaciar');
const msgVacio     = document.querySelector('#msg-vacio');



// ── Actualizar badge del navbar ──
function updateBadge() {
  badge.textContent = cantidadItems;
  badge.style.transform = 'scale(1.4)';
  setTimeout(() => { badge.style.transform = 'scale(1)'; }, 180);
}

// ── Actualizar total ──
function updateTotal() {
  spanTotal.textContent = '$' + totalAcumulado.toLocaleString('es-CO', {
    minimumFractionDigits: 2
  });
}

// ── Controlar mensaje vacío ──
function updateMsgVacio() {
  msgVacio.style.display = cantidadItems === 0 ? 'flex' : 'none';
}

// ── Recalcular totales desde el estado del carrito ──
function recalcularTotales() {
  cantidadItems  = 0;
  totalAcumulado = 0;
  Object.values(carrito).forEach(function (item) {
    cantidadItems  += item.cantidad;
    totalAcumulado += item.precio * item.cantidad;
  });
  updateTotal();
  updateBadge();
  updateMsgVacio();
}

// ── Actualizar el subtotal visible dentro del <li> ──
function updateSubtotalLi(key) {
  const item = carrito[key];
  const subtotal = item.precio * item.cantidad;
  item.li.querySelector('.cart-item-price').textContent =
    '$' + subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 });
  item.li.querySelector('.cart-item-qty').textContent = item.cantidad;
}

// ── Crear un nuevo <li> para un producto ──
function crearItemLi(key, nombre, precio, imagen) {

  const img = document.createElement('img');
  img.src = imagen;
  img.alt = nombre;
  img.classList.add('cart-item-img');

  const li = document.createElement('li');
  li.classList.add('cart-item');

  // Info: nombre + subtotal
  const info = document.createElement('div');
  info.classList.add('cart-item-info');

  const nombreEl = document.createElement('span');
  nombreEl.classList.add('cart-item-name');
  nombreEl.textContent = nombre;

  const precioEl = document.createElement('span');
  precioEl.classList.add('cart-item-price');
  precioEl.textContent = '$' + parseFloat(precio).toLocaleString('es-CO', {
    minimumFractionDigits: 2
  });

  info.appendChild(nombreEl);
  info.appendChild(precioEl);

  // Controles de cantidad: − | n | +
  const controles = document.createElement('div');
  controles.classList.add('qty-controls');

  const btnMenos = document.createElement('button');
  btnMenos.classList.add('btn-qty');
  btnMenos.textContent = '−';

  const spanQty = document.createElement('span');
  spanQty.classList.add('cart-item-qty');
  spanQty.textContent = '1';

  const btnMas = document.createElement('button');
  btnMas.classList.add('btn-qty');
  btnMas.textContent = '+';

  controles.appendChild(btnMenos);
  controles.appendChild(spanQty);
  controles.appendChild(btnMas);

  // Botón eliminar ✕
  const btnEliminar = document.createElement('button');
  btnEliminar.classList.add('btn-eliminar');
  btnEliminar.textContent = '✕';

  li.appendChild(img);
  li.appendChild(info);
  li.appendChild(controles);
  li.appendChild(btnEliminar);

  listaCarrito.appendChild(li);

  // ── Evento: sumar unidad ──
  btnMas.addEventListener('click', function () {
    carrito[key].cantidad += 1;
    updateSubtotalLi(key);
    recalcularTotales();
  });

  // ── Evento: restar unidad ──
  btnMenos.addEventListener('click', function () {
    if (carrito[key].cantidad > 1) {
      carrito[key].cantidad -= 1;
      updateSubtotalLi(key);
      recalcularTotales();
    } else {
      // Si llega a 0, eliminar el ítem completo
      eliminarItem(key);
    }
  });

  // ── Evento: eliminar ✕ ──
  btnEliminar.addEventListener('click', function () {
    eliminarItem(key);
  });

  return li;
}

// ── Eliminar un ítem del carrito por su key ──
function eliminarItem(key) {
  carrito[key].li.remove();
  delete carrito[key];
  recalcularTotales();
}

// ── Agregar producto al carrito ──
function agregarAlCarrito(nombre, precio, imagen) {
  const key = nombre; // usamos el nombre como clave única

  if (carrito[key]) {
    // Ya existe: solo incrementar cantidad
    carrito[key].cantidad += 1;
    updateSubtotalLi(key);
  } else {
    // Producto nuevo: crear entrada y <li>
    const li = crearItemLi(key, nombre, precio, imagen);
    carrito[key] = {
      nombre:   nombre,
      precio:   parseFloat(precio),
      cantidad: 1,
      li:       li,
      imagen
    };
  }


  recalcularTotales();
}

// ── Escuchar clics en todos los botones "Agregar" ──
const botonesAgregar = document.querySelectorAll('.btn-agregar');

botonesAgregar.forEach(function (boton) {
  boton.addEventListener('click', function () {
    const nombre = boton.dataset.nombre;
    const precio = boton.dataset.precio;
    const imagen  = boton.dataset.imagen;
    agregarAlCarrito(nombre, precio, imagen);
  });
});

// ── Vaciar el carrito ──
btnVaciar.addEventListener('click', function () {
  listaCarrito.querySelectorAll('li:not(#msg-vacio)').forEach(function (li) {
    li.remove();
  });

  // Limpiar el objeto de estado
  Object.keys(carrito).forEach(function (key) {
    delete carrito[key];
  });

  cantidadItems  = 0;
  totalAcumulado = 0;

  updateTotal();
  updateBadge();
  updateMsgVacio();
});

// ── Inicialización ──
updateTotal();
updateBadge();
updateMsgVacio();
