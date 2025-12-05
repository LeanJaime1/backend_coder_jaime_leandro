import CartModel from '../models/cart.models.js';
import { cartManager } from "../index.js";


export const renderCartView = async (req, res) => {
    const { cid } = req.params;
    try {
        console.log("\n--- DEBUG START ---");
        console.log("1. Buscando carrito con ID:", cid);

        const cart = await CartModel.findById(cid)
            .populate('products.product')
            .lean();

       
        console.log("2. Resultado de la base de datos:", JSON.stringify(cart, null, 2));

        if (!cart) {
            console.log("3. El carrito es NULL (No existe)");
            return res.status(404).render('errors', { error: 'Carrito no encontrado' });
        }

        if(cart.products.length > 0) {
            cart.products.forEach((item, index) => {
                console.log(`   - Producto ${index}:`, item.product);
            });
        } else {
            console.log("   - El array de productos está vacío.");
        }

        console.log("--- DEBUG END ---\n");

        res.render('cart', {
            products: cart.products,
            cid: cart._id,
            title: "Mi Carrito"
        });

    } catch (error) {
        console.error("ERROR FATAL:", error);
        res.status(500).send("Error al mostrar el carrito");
    }
}

export const postCartController = async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.send(newCart);
    } catch (error) {
        res.status(500).send({ error: 'Error al crear carrito' });
    }
}

export const getCartController = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            res.status(200).json(cart.products);
        } else {
            res.status(404).json({ error: `Carrito no encontrado.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error interno.' });
    }
}

export const addCartController = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartManager.addProductToCart(cid, pid);
        if (!cart) return res.status(404).json({ error: `Carrito no encontrado.` });
        res.status(200).json({ message: `Producto agregado.`, cart: cart });
    } catch (error) {
        res.status(500).json({ error: 'Error interno.' });
    }
}

export const deleteProductFromCartController = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartManager.deleteProductFromCart(cid, pid);
        res.status(200).send({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).send({ error: "Error interno." });
    }
};

export const updateCartController = async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body; 
        const cart = await cartManager.updateCart(cid, products);
        res.status(200).send({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).send({ error: "Error interno." });
    }
};

export const updateProductQuantityController = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const cart = await cartManager.updateProductQuantity(cid, pid, quantity);
        res.status(200).send({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).send({ error: "Error interno." });
    }
};

export const clearCartController = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.clearCart(cid);
        res.status(200).send({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).send({ error: "Error interno." });
    }
};