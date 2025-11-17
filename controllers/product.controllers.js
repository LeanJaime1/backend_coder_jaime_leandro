import { manager } from "../index.js";

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