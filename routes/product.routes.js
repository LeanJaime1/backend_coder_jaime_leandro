import express from "express"
import { 
    deleteProductController, 
    getIdProductController, 
    getProductController, 
    getProductViewController, 
    postProductConroller, 
    putProductController, 
    realTimeProductsController, 
    rootController,
    renderProductsController,
    renderCartController
} from "../controllers/product.controllers.js";

const router = express.Router()

// Vistas
router.get("/", rootController);
router.get("/realTimeProducts", realTimeProductsController);
router.get('/products', renderProductsController);
router.get('/cart/:cid', renderCartController);
router.get('/home', getProductViewController);

// API
router.get('/api/products', getProductController);
router.post('/api/products', postProductConroller);
router.get('/api/products/:pid', getIdProductController);
router.put('/api/products/:pid', putProductController);
router.delete('/api/products/:pid', deleteProductController);

export default router