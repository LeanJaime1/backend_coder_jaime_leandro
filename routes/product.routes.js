import express from "express"
import { deleteProductController, getIdProductController, getProductController, getProductViewController, postProductConroller, putProductController, realTimeProductsController, rootController } from "../controllers/product.controllers.js";


const router = express.Router()

//inicio
router.get("/", rootController);

//realTimeProducts
router.get("/realTimeProducts", realTimeProductsController)

//product view
router.get('/home', getProductViewController)

//ruta de get
router.get('/api/products', getProductController);

//ruta de post
router.post('/api/products', postProductConroller);

//ruta para id
router.get('/api/products/:pid', getIdProductController);

//ruta put
router.put('/api/products/:pid',putProductController);

//ruta delete
router.delete('/api/products/:pid', deleteProductController);



export default router