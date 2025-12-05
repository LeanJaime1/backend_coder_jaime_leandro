document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); 
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');

    socket.on('productsUpdate', (products) => {
        let html = '';
        if (!products || products.length === 0) {
            html = '<p class="empty-message">No hay productos disponibles.</p>';
        } else {
            products.forEach(product => {
                html += `
                    <div class="product-card">
                        <div>
                            <h3>${product.title}</h3>
                            <div class="product-info">
                                <p>${product.description}</p>
                                <p><strong>Código:</strong> ${product.code}</p>
                                <p><strong>Stock:</strong> ${product.stock}</p>
                                <p><strong>Categoría:</strong> ${product.category}</p>
                            </div>
                        </div>
                        
                        <div>
                            <p class="product-price">$${product.price}</p>
                            <button class="btn-delete" data-id="${product._id || product.id}">
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        productList.innerHTML = html;

       
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
             
                if(confirm('¿Estás seguro de eliminar este producto?')) {
                    socket.emit('deleteProduct', id);
                }
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
                category: document.getElementById('category').value, 
                status: true,
                thumbnails: []
            };

            if(!newProduct.category) {
                alert("La categoría es obligatoria");
                return;
            }

            socket.emit('addProduct', newProduct);
            productForm.reset();
        });
    }
});