import { manager, cartManager } from "../index.js"; 

//VISTAS

export const renderProductsController = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const products = await manager.getProducts({
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query
        });

        res.render('products', {
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: products.hasNextPage ? `/products?page=${products.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
            title: "Listado de Productos"
        });

    } catch (error) {
        console.error("Error al renderizar productos:", error);
        res.status(500).send("Error de servidor");
    }
};

export const renderCartController = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);

        if (!cart) {
            return res.status(404).render('error', { message: "Carrito no encontrado" });
        }

        res.render('cart', {
            title: "Mi Carrito",
            cartId: cid,
            products: cart.products 
        });

    } catch (error) {
        console.error("Error al renderizar carrito:", error);
        res.status(500).send("Error de servidor");
    }
};

export const rootController = (req, res) => {
    res.render("index", { title: "Inicio" });
}

export const realTimeProductsController = async (req, res) => {
    res.render('realTimeProducts', { title: "Tiempo Real" });
};

export const getProductViewController = async (req, res) => {
    
    res.redirect('/products');
}


//API

export const getProductController = async (req, res) => {
    try {
        let { limit, page, sort, query } = req.query;
        const products = await manager.getProducts({ 
            limit: parseInt(limit) || 10, 
            page: parseInt(page) || 1, 
            sort, 
            query 
        });

        const prevLink = products.hasPrevPage 
            ? `/api/products?page=${products.prevPage}&limit=${limit || 10}&sort=${sort || ''}&query=${query || ''}` 
            : null;
        const nextLink = products.hasNextPage 
            ? `/api/products?page=${products.nextPage}&limit=${limit || 10}&sort=${sort || ''}&query=${query || ''}` 
            : null;

        res.send({
            status: "success",
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink
        });
    } catch (error) {
        res.status(500).send({ status: "error", error: 'Error al obtener productos.' });
    }
}

export const getIdProductController = async (req, res) => {
    try {
        const product = await manager.getProductById(req.params.pid);
        if (product) res.status(200).json(product);
        else res.status(404).json({ error: `Producto no encontrado.` });
    } catch (error) {
        res.status(500).json({ error: 'Error interno.' });
    }
}

export const postProductConroller = async (req, res) => {
    try {
        const newProduct = await manager.addProduct(req.body);
        res.status(201).send(newProduct); 
    } catch (error) {
        res.status(500).send({ error: 'Error al guardar.' });
    }
}

export const putProductController = async (req, res) => {
    try {
        const updateData = req.body;
        if (updateData._id) delete updateData._id;
        const updatedProduct = await manager.updateProduct(req.params.pid, updateData);
        if (updatedProduct) res.status(200).json(updatedProduct);
        else res.status(404).json({ error: `Producto no encontrado.` });
    } catch (error) {
        res.status(500).json({ error: 'Error interno.' });
    }
}

export const deleteProductController = async (req, res) => {
    try {
        const deletedProduct = await manager.deleteProduct(req.params.pid);
        if (deletedProduct) {
            res.status(200).json({ message: `Eliminado.`, deleted: deletedProduct });
        } else res.status(404).json({ error: `Producto no encontrado.` });
    } catch (error) {
        res.status(500).json({ error: 'Error interno.' });
    }
}