import express from "express"
import { 
    addCartController, 
    getCartController, 
    postCartController,
    deleteProductFromCartController,
    updateCartController,
    updateProductQuantityController,
    clearCartController
} from "../controllers/cart.controllers.js";

const router = express.Router()

router.post('/', postCartController)
router.get('/:cid', getCartController);
router.post('/:cid/product/:pid', addCartController);
router.delete('/:cid/products/:pid', deleteProductFromCartController);
router.put('/:cid', updateCartController);
router.put('/:cid/products/:pid', updateProductQuantityController);
router.delete('/:cid', clearCartController);

export default router