import express from "express"
import handlebars from "express-handlebars"
import fs from "fs/promises"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"


//server
const server = express()


//server.engine("handlebars", motor)
server.engine('handlebars', handlebars.engine())
//server.set("view engine", "handlebars")
server.set('view engine','handlebars')




//conf server
const PORT = 8080

//middleware
server.use(express.json())
server.use(express.static("public"))

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
export const manager = new ProductManager()


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


export const cartManager = new CartManager(CARTS_FILE);

//RUTAS

//products
server.use("/", productRouter)
//carts
server.use("/api/carts", cartRouter)



server.listen(PORT, ()=>{
    console.log(`Server funcionando en el puerto ${PORT}`)
})