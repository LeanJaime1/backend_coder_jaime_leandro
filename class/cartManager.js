import fs from "fs/promises";



// cartManager
export class CartManager {
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


