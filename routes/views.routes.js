import { Router } from 'express';
import { renderCartView } from '../controllers/cart.controllers.js';
import { manager } from '../index.js';

const router = Router();

//RUTA DE PRODUCTOS 
router.get('/products', async (req, res) => {
    try {
      
        const { page = 1, limit = 10 } = req.query;

    
        const result = await manager.getProducts({ page, limit, lean: true });

       
        res.render('products', {
            title: 'Listado de Productos',
            products: result.docs, 
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null,
            page: result.page,
            totalPages: result.totalPages
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).render('errors', { error: 'Error al cargar los productos' });
    }
});


router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});


router.get('/cart/:cid', renderCartView);


router.get('/', (req, res) => {
    res.redirect('/products');
});


router.get('/cart', (req, res) => {
    res.render('cart', { 
        title: "Mi Carrito",
        products: [] 
    }); 
});



export default router;