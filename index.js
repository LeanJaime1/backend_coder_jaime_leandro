import express from "express"
import fs from "fs/promises"

const server = express()

const PORT = 8080

server.use(express.json())



const PRODUCTS_FILE ='products.json';
const CARTS_FILE = './carts.json';



//CLASES

//productManager
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



//cartManager
class CartManager {
     constructor(path){
        this.path = path;
     }
   

    async readCarts (){
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            
            if (data.trim() === '') {
                return [];
            }
            
            return JSON.parse(data);
            
        } catch (error) {
           
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error; 
        }
    }



     async createCarts (){
        const carts = await this.readCarts()

        let newId
        if (carts.length === 0){
            newId = 1

        }   else {
            newId = carts[carts.length -1].id + 1
        }

        const newCart = {
            id: newId,
            products : []
        }

        carts.push(newCart)

        const cartsStringified = JSON.stringify(carts)
        await fs.writeFile(this.path, cartsStringified)
        return newCart
        

        
}
}


const cartManager = new CartManager(CARTS_FILE);









//RUTAS


//ruta de get

server.get('/api/products', async (req, res) => {
    try {
        
        const products = await manager.getProducts();
        
        res.send(products); 
    } catch (error) {
        console.error('Error en GET /api/products:', error);
        res.status(500).send({ error: 'Hubo un error al obtener los productos.' }); 
    }
});


//ruta de post
server.post('/api/products', async (req, res) => {
    
    
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const productData = req.body;

    const missingField = requiredFields.find(field => !productData[field]);

    if (missingField) {
       
        return res.status(400).send({ 
            error: `Falta el campo obligatorio: ${missingField}` 
        });
    }

    
    try {
        const newProduct = await manager.addProduct(productData);
        
        res.status(201).send(newProduct); 
    } catch (error) {
        console.error('Error en POST /api/products:', error);
        res.status(500).send({ 
            error: 'Error al intentar guardar el producto en el servidor.' 
        });
    }
});


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



server.listen(PORT, ()=>{
    console.log(`Server funcionando en el puerto ${PORT}`)
})