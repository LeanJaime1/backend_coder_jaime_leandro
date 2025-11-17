import express from "express"
import { deleteProductController, getIdProductController, getProductController, postProductConroller, putProductController } from "../controllers/product.controllers.js";


const router = express.Router()



//ruta de get
router.get('/', getProductController);

//ruta de post
router.post('/api/products', postProductConroller);

//ruta para id
router.get('/api/products/:pid', getIdProductController);

//ruta put
router.put('/api/products/:pid',putProductController);

//ruta delete
router.delete('/api/products/:pid', deleteProductController);



export default router