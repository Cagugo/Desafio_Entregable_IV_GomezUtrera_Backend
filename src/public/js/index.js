
// Conecta el cliente a Socket.io
const socket = io();

// Escucha el evento 'newProduct' emitido por el servidor
socket.on('newProduct', (product) => {
  const productRow = `
    <tr id="${product.id}">
      <td>${product.id}</td>
      <td>${product.title}</td>
      <td>${product.description}</td>
      <td>${product.code}</td>
      <td>${product.price}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">Eliminar</button>
      </td>
    </tr>
  `;
  const productTable = document.getElementById('product-table');
  productTable.insertAdjacentHTML('beforeend', productRow);
});

// Escucha el evento 'deleteProduct' emitido por el servidor
socket.on('deleteProduct', (productId) => {
  // Elimina la fila correspondiente de la tabla de productos
  const productRow = document.getElementById(productId);
  if (productRow) {
    productRow.remove();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const productForm = document.getElementById('productForm');

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(productForm);
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      // Cualquier otra acción que desees después de agregar el producto correctamente
      // Restablecer los valores del formulario
      productForm.reset();
    } else {
      const error = await response.json();
      console.error('Error al agregar el producto:', error);
    }
  });
});

function deleteProduct(id) {
  fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (response.ok) {
        // La eliminación se realizó correctamente
        socket.emit('deleteProduct', id);
      } else {
        // La eliminación falló
        console.error('Error al eliminar el producto');
      }
    })
    .catch((error) => {
      console.error('Error al eliminar el producto:', error);
    });
}

socket.on('productDeleted', function (id) {
  var row = document.getElementById(id);
  if (row) {
    row.parentNode.removeChild(row);
  }
});
