import fs from "fs/promises"; 

export class ProductManager {
    
    
    constructor(path) {
        this.path = path;
    }
      
    async getProducts() {
        try {
            
            const data = await fs.readFile(this.path, { encoding: 'utf-8' });
            return JSON.parse(data.trim() || '[]');
        } catch (error) {
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
      
        await fs.writeFile(this.path, productsStringified);

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
      
        await fs.writeFile(this.path, productsStringified);

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
        
       
        await fs.writeFile(this.path, productsStringified);
        
        return newProduct;
    }
}