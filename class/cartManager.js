import CartModel from "../models/cart.models.js";

export class CartManager {
    async createCart() {
        try {
            return await CartModel.create({ products: [] });
        } catch (error) {
            console.log("Error al crear carrito:", error);
            throw error;
        }
    }

    async getCartById(id) {
        try {
            return await CartModel.findById(id).lean();
        } catch (error) {
            console.log("Error al obtener carrito:", error);
            return null;
        }
    }

    async addProductToCart(cid, pid) {
        try {
            const cart = await CartModel.findById(cid);
            if (!cart) return null;

            const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

            if (productIndex !== -1) {
                cart.products[productIndex].quantity++;
            } else {
                cart.products.push({ product: pid, quantity: 1 });
            }

            await cart.save();
            return cart;
        } catch (error) {
            console.log("Error al agregar producto al carrito:", error);
            throw error;
        }
    }

    async deleteProductFromCart(cid, pid) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cid, 
                { $pull: { products: { product: pid } } }, 
                { new: true }
            );
            return cart;
        } catch (error) {
            throw new Error("Error al eliminar producto del carrito");
        }
    }

    async updateCart(cid, products) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cid, 
                { products: products }, 
                { new: true }
            );
            return cart;
        } catch (error) {
            throw new Error("Error al actualizar carrito");
        }
    }

    async updateProductQuantity(cid, pid, quantity) {
        try {
            const cart = await CartModel.findOneAndUpdate(
                { _id: cid, "products.product": pid },
                { $set: { "products.$.quantity": quantity } },
                { new: true }
            );
            return cart;
        } catch (error) {
            throw new Error("Error al actualizar cantidad");
        }
    }

    async clearCart(cid) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cid, 
                { products: [] }, 
                { new: true }
            );
            return cart;
        } catch (error) {
            throw new Error("Error al vaciar carrito");
        }
    }
}