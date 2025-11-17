import express from "express"
import { cartManager, manager } from "../index.js"



const router = express.Router()



//post para carrito
router.post('/', async (req,res)=>{
    try {
        const newCart = await cartManager.createCarts()
        res.send(newCart)
    } catch (error) {
        console.log('Error al crear el carrito', error)
        res.status(500).send({ error: 'Error al crear el carrito' })
    }
})


//ruta :cid para carrito
router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);

        if (isNaN(cartId)) {
            return res.status(400).json({ error: 'ID de carrito inválido. Debe ser un número.' });
        }

        const cart = await cartManager.getCartById(cartId);

        if (cart) {
            
            res.status(200).json(cart.products);
        } else {
            res.status(404).json({ error: `Carrito con ID ${cartId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al obtener carrito por ID:', error);
        res.status(500).json({ error: 'Error interno del servidor al buscar el carrito.' });
    }
});


//ruta para agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);

        if (isNaN(cartId) || isNaN(productId)) {
            return res.status(400).json({ error: 'IDs de carrito y/o producto inválidos. Deben ser números.' });
        }

        const product = await manager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: `Producto con ID ${productId} no encontrado.` });
        }

   
        const result = await cartManager.addProductToCart(cartId, productId);

        if (result.status === 404) {
            return res.status(404).json({ error: result.message });
        }

       
        res.status(200).json({
            message: `Producto ID ${productId} agregado/actualizado en carrito ID ${cartId}.`,
            cart: result.cart 
        });

    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor al modificar el carrito.' });
    }
});







export default router