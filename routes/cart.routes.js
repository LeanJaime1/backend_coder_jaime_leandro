import express from "express"
import {  addCartController, getCartController, postCartController } from "../controllers/cart.controllers.js";



const router = express.Router()



//post para carrito
router.post('/', postCartController)


//ruta :cid para carrito
router.get('/:cid', getCartController);


//ruta para agregar producto al carrito
router.post('/:cid/product/:pid', addCartController);







export default router