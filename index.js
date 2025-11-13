import express from "express"
import fs from "fs/promises"

const server = express()

const PORT = 8080

server.use(express.json())

const PRODUCTS_FILE ='products.json';
const CARTS_FILE = './carts.json';


//CLASES

// ProductManager
class ProductManager {
    constructor(){
        
    }
      
    
    async getProducts() {
            try {
            const data = await fs.readFile(PRODUCTS_FILE,{ encoding:'utf-8'} )
            return JSON.parse(data.trim() || '[]');
        }   catch(error)  {
                if (error.code === 'ENOENT') {
                    return []; 
                }
                console.error('Error al leer productos:', error);
                    return [];
        }
    }


    async getProductById(id) {
        const products = await this.getProducts();
        const product = products.find(p => p.id === id);
        return product; 
    }


    async updateProduct(id, updateData) {
        const products = await this.getProducts();
    
        const index = products.findIndex(p => p.id === id); 

        if (index === -1) {
            return null; 
        }

        const currentProduct = products[index];

        const updatedProduct = {
            ...currentProduct,
            ...updateData,
    
            id: currentProduct.id 
        };

    
        products[index] = updatedProduct;

        
        const productsStringified = JSON.stringify(products, null, 2);
        await fs.writeFile(PRODUCTS_FILE, productsStringified);

        return updatedProduct; 
    }
    
    
    async deleteProduct(id) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id); 

        if (index === -1) {
            return null; 
        }

     
        const deletedProducts = products.splice(index, 1);
        const deletedProduct = deletedProducts[0];

       
        const productsStringified = JSON.stringify(products, null, 2);
        await fs.writeFile(PRODUCTS_FILE, productsStringified);

        return deletedProduct; 
    }


    async addProduct(productData) {
        const products = await this.getProducts();

        
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        const newId = maxId + 1;

        
        const newProduct = {
            id: newId,
            status: true, 
            ...productData,
            thumbnails: productData.thumbnails || [] 
        };
        
        
        products.push(newProduct);
        const productsStringified = JSON.stringify(products, null, 2);
        await fs.writeFile(PRODUCTS_FILE, productsStringified);
        
        return newProduct;
    }

}
const manager = new ProductManager()


// cartManager
class CartManager {
    constructor(path){
        this.path = path;
    }
    
    async readCarts (){
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            if (data.trim() === '') { return []; }
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') { return []; }
            throw error; 
        }
    }


    async writeCarts(carts) {
        try {
            const cartsStringified = JSON.stringify(carts, null, 2);
            await fs.writeFile(this.path, cartsStringified);
        } catch (error) {
            console.error('Error al escribir los carritos:', error);
            throw new Error('No se pudo guardar la información de los carritos.');
        }
    }


    async getCartById(id) {
        const carts = await this.readCarts();
        const cart = carts.find(c => c.id === id);
        return cart;
    }


    async addProductToCart(cartId, productId) {
        const carts = await this.readCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) {
            return { status: 404, message: `Carrito con ID ${cartId} no encontrado.` };
        }

        const cart = carts[cartIndex];
        const productInCartIndex = cart.products.findIndex(p => p.product === productId);

        if (productInCartIndex !== -1) {
            
            cart.products[productInCartIndex].quantity += 1;
        } else {
            
            cart.products.push({
                product: productId,
                quantity: 1
            });
        }
        
        
        await this.writeCarts(carts);

        return { status: 200, cart: cart };
    }





    async createCarts (){
        const carts = await this.readCarts()
        
        let newId = carts.length === 0 ? 1 : carts[carts.length -1].id + 1
        
        const newCart = { id: newId, products : [] }
        carts.push(newCart)
        
        await this.writeCarts(carts);
        
        return newCart
    }
}


const cartManager = new CartManager(CARTS_FILE);




//ruta get
server.get('/api/products', async (req, res) => {
    try {
        const products = await manager.getProducts();
        res.send(products); 
    } catch (error) {
        console.error('Error en GET /api/products:', error);
        res.status(500).send({ error: 'Hubo un error al obtener los productos.' }); 
    }
});


//ruta post
server.post('/api/products', async (req, res) => {
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
});


//ruta para obtener el id
server.get('/api/products/:pid', async (req, res) => {
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
});


//ruta put
server.put('/api/products/:pid', async (req, res) => {
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
});


//ruta delete
server.delete('/api/products/:pid', async (req, res) => {
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
});



//CARRITO


//post para carrito
server.post('/api/carts', async (req,res)=>{
    try {
        const newCart = await cartManager.createCarts()
        res.send(newCart)
    } catch (error) {
        console.log('Error al crear el carrito', error)
        res.status(500).send({ error: 'Error al crear el carrito' })
    }
})


//ruta :cid para carrito
server.get('/api/carts/:cid', async (req, res) => {
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
server.post('/api/carts/:cid/product/:pid', async (req, res) => {
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




server.listen(PORT, ()=>{
    console.log(`Server funcionando en el puerto ${PORT}`)
})