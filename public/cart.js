document.addEventListener('DOMContentLoaded', () => {
    
    const cartId = localStorage.getItem('cartId'); 
    const cartLink = document.getElementById('nav-cart-link');

    if (cartLink) {
        if (cartId) {
            
            cartLink.href = `/cart/${cartId}`;
        } else {
            cartLink.href = '/cart'; 
        }
    }
});


window.addToCart = async function(productId) {
    try {
        let cartId = localStorage.getItem('cartId');

        
        if (!cartId) {
            const response = await fetch('/api/carts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
          
            cartId = data._id || (data.payload && data.payload._id); 
            
            if(cartId) {
                localStorage.setItem('cartId', cartId);
                console.log("Nuevo carrito creado ID:", cartId);
                
              
                const cartLink = document.getElementById('nav-cart-link');
                if(cartLink) cartLink.href = `/cart/${cartId}`; 
            } else {
                console.error("No se pudo obtener ID del carrito al crearlo");
                return; 
            }
        }

     
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            
            alert("✅ Producto agregado al carrito!");
        } else {
            console.error("Error backend:", await response.json());
            alert("❌ Error al agregar producto.");
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("Hubo un problema de conexión.");
    }
};