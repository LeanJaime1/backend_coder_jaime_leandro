import express from "express"

import { 
    deleteProductController, 
    getIdProductController, 
    getProductController, 
    getProductViewController, 
    postProductConroller, 
    putProductController, 
    realTimeProductsController, 
    rootController 
} from "../controllers/product.controllers.js";

const router = express.Router()


router.get("/", rootController);

router.get("/realTimeProducts", realTimeProductsController)

router.get('/home', getProductViewController)

router.get('/api/products', getProductController);

router.post('/api/products', postProductConroller);

router.get('/api/products/:pid', getIdProductController);

router.put('/api/products/:pid', putProductController);

router.delete('/api/products/:pid', deleteProductController);

export default router