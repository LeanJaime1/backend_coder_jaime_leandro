
document.addEventListener('DOMContentLoaded', () => {
    
    const socket = io(); 

    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');

    if (!productForm) {
        console.error("Error: No se encontró el formulario con ID 'product-form'");
    } else {
        console.log("Formulario encontrado correctamente.");
    }

    socket.on('productsUpdate', (products) => {
        console.log("Productos recibidos:", products);
        let html = '';
        
        if (!products || products.length === 0) {
            html = '<p>No hay productos disponibles.</p>';
        } else {
            products.forEach(product => {
                html += `
                    <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background: #fff;">
                        <h3>${product.title}</h3>
                        <p>Precio: $${product.price}</p>
                        <p>Stock: ${product.stock}</p>
                        <p>ID: ${product.id}</p>
                        <button class="delete-btn" data-id="${product.id}" style="color:white; background:red; cursor:pointer;">Eliminar</button>
                    </div>
                `;
            });
        }
        productList.innerHTML = html;

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                socket.emit('deleteProduct', id);
            });
        });
    });

    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newProduct = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                price: parseFloat(document.getElementById('price').value), 
                code: document.getElementById('code').value,
                stock: parseInt(document.getElementById('stock').value),  
                status: true,
                thumbnails: []
            };

            console.log("Enviando:", newProduct);
            socket.emit('addProduct', newProduct);
            
            productForm.reset();
        });
    }
});