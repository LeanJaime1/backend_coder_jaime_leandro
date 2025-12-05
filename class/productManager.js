import ProductModel from "../models/products.models.js";

export class ProductManager {
    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        try {
            let queryOptions = {};

            if (query) {
                queryOptions = {
                    $or: [
                        { category: { $regex: query, $options: "i" } },
                        
                        ...(query.toLowerCase() === 'true' || query.toLowerCase() === 'false' 
                            ? [{ status: query.toLowerCase() === 'true' }] 
                            : [])
                    ]
                };
            }

            const sortOptions = {};
            if (sort) {
                if (sort === 'asc') sortOptions.price = 1;
                if (sort === 'desc') sortOptions.price = -1;
            }

            const result = await ProductModel.paginate(queryOptions, {
                limit: limit,
                page: page,
                sort: sortOptions,
                lean: true 
            });
            return result;
        } catch (error) {
            console.log("Error al obtener productos:", error);
            throw error;
        }
    }

    async addProduct(product) {
        try {
            return await ProductModel.create(product);
        } catch (error) {
            console.log("Error al agregar producto:", error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            return await ProductModel.findById(id).lean();
        } catch (error) {
            console.log("Error al buscar producto por ID:", error);
            return null;
        }
    }

    async updateProduct(id, productUpdate) {
        try {
            return await ProductModel.findByIdAndUpdate(id, productUpdate, { new: true }).lean();
        } catch (error) {
            console.log("Error al actualizar producto:", error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            return await ProductModel.findByIdAndDelete(id);
        } catch (error) {
            console.log("Error al eliminar producto:", error);
            return null;
        }
    }
}