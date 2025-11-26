import express from "express"
import { 
    addCartController, 
    getCartController, 
    postCartController 
} from "../controllers/cart.controllers.js";

const router = express.Router()

router.post('/', postCartController)

router.get('/:cid', getCartController);

router.post('/:cid/product/:pid', addCartController);

export default router