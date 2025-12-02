import { manager } from "../index.js";
import ProductModel from "../models/products.models.js";


//controladores de MongoDB
export const getAllProducts = async (req,res) => {
    
    

    //FILTROS Y QUE MOSTRAR EN LA RESPUESTA
//    const respuesta = await ProductModel.find({
//     edad : {
//         $gt : 30
//     }
//    },{
//         nombre : 1,
//         email : 1,
//         _id : 0
//    })


    const respuesta = await ProductModel.find({}).skip(1)


    res.send(respuesta)

}

export const createProducts = async (req,res) => {
   
   
   const {edad, nombre, email} = req.body
   
   
   const respuesta = await ProductModel.create({ edad : edad,
                          nombre : nombre,
                          email : email 

    })
    res.send (respuesta)
}

export const updateProducts = async (req,res) => {
    const {id} = req.params
    const {nombre} = req.body
    
    console.log(id)
    console.log(nombre)


    const resultado = await ProductModel.updateOne({_id : id},{nombre : nombre})

    res.send({
        error : false,
        payload : resultado
    })
}

export const deleteProducts = async (req,res) => {

    const {id} = req.params

    const resultado = await ProductModel.deleteOne({ _id : id})

    res.send({
        error : false ,
        payload : id
    })
}

export const getProductById = async (req,res) => {
    
    const {id} = req.params

  const respuesta = await ProductModel.find({ _id : id})

    res.send({
        error : false,
        payload : respuesta
    })
}

export const getProductsByFilter = async (req,res) =>{

    const {limit,skip} =req.query
    
    
    console.log("limit", limit)
    console.log("skip", skip)


    const respuesta = await ProductModel.find({}).limit(limit).skip(skip)


    res.send({
        error : false,
        payload : {
            respuesta
        }
    })

}




//inicio view
export const rootController = (req, res) => {
    res.render("index", {
        title: "Página de Inicio", 
        description: "Mi página Full Stack"
    });
}

export const realTimeProductsController = async (req, res) => {
    try {
        const products = await manager.getProducts();
        
        res.render('realTimeProducts', {
            title: "Productos en Tiempo Real",
            description: "Vista de productos actualizada con Socket.IO",
            products: products 
        });
    } catch (error) {
        console.error('Error al renderizar la vista de productos en tiempo real:', error);
        res.status(500).render('error', { message: 'No se pudo cargar la vista en tiempo real.' });
    }
};

//controlador de get product view
export const getProductViewController = async (req, res) => {
    try {
        const products = await manager.getProducts(); 
    
        res.render('home', { 
            products: products, 
            title: "Lista de Productos" 
        });

    } catch (error) {
        console.error('Error al renderizar la vista de productos:', error);
        res.status(500).render('error', { message: 'No se pudo cargar la vista.' });
    }
}





//controlador de get
export const getProductController = async (req, res) => {

    try {
        const products = await manager.getProducts();
        res.send(products); 
    } catch (error) {
        console.error('Error en GET /api/products:', error);
        res.status(500).send({ error: 'Hubo un error al obtener los productos.' }); 
    }
}

//controlador de post
export const postProductConroller = async (req, res) => {
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const productData = req.body;
    const missingField = requiredFields.find(field => !productData[field]);

    if (missingField) {
        return res.status(400).send({ error: `Falta el campo obligatorio: ${missingField}` });
    }

    try {
        const newProduct = await manager.addProduct(productData);
        
        const updatedProducts = await manager.getProducts();
        
        if (req.io) {
            req.io.emit('productsUpdate', updatedProducts); 
        }

        res.status(201).send(newProduct); 
    } catch (error) {
        console.error('Error en POST /api/products:', error);
        res.status(500).send({ error: 'Error al intentar guardar el producto en el servidor.' });
    }
}

//controlador de id
export const getIdProductController = async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido. Debe ser un número.' });
        }
        const product = await manager.getProductById(productId);

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: `Producto con ID ${productId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ error: 'Error interno del servidor al buscar el producto.' });
    }
}

//controlador de put
export const putProductController = async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updateData = req.body;

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido. Debe ser un número.' });
        }

        if (updateData.id) {
             delete updateData.id;
        }

        const updatedProduct = await manager.updateProduct(productId, updateData);

        if (updatedProduct) {
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ error: `Producto con ID ${productId} no encontrado para actualizar.` });
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el producto.' });
    }
}

//controlador de delete
export const deleteProductController = async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido. Debe ser un número.' });
        }

        const deletedProduct = await manager.deleteProduct(productId);

        if (deletedProduct) {
            const updatedProducts = await manager.getProducts();
            if (req.io) {
                req.io.emit('productsUpdate', updatedProducts); 
            }
            
            res.status(200).json({
                message: `Producto con ID ${productId} eliminado correctamente.`,
                deleted: deletedProduct 
            });
        } else {
            res.status(404).json({ error: `Producto con ID ${productId} no encontrado para eliminar.` });
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el producto.' });
    }
}