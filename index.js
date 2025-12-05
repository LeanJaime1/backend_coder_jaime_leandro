import express from "express";
import http from "http";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import mongoose from "mongoose";

//Rutas
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import viewsRouter from './routes/views.routes.js';

//Managers (Clases)
import { ProductManager } from "./class/productManager.js";
import { CartManager } from "./class/cartManager.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//Instancias de Managers
export const manager = new ProductManager();
export const cartManager = new CartManager();


//Server
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configuración Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutas
app.use("/api/products", productRouter); 
app.use("/api/carts", cartRouter); 
app.use('/', viewsRouter);


// WebSockets
io.on("connection", async (socket) => {
    console.log("Cliente conectado por WebSocket");
    

    const products = await manager.getProducts({ limit: 100 }); 
    socket.emit("productsUpdate", products.docs);


    socket.on("addProduct", async (productData) => {
        try {
            await manager.addProduct(productData);
            const updatedProducts = await manager.getProducts({ limit: 100 });
            io.emit("productsUpdate", updatedProducts.docs);
        } catch (error) {
            console.error("Error al agregar producto via socket:", error);
        }
    });


    socket.on("deleteProduct", async (id) => {
        try {
            await manager.deleteProduct(id);
            const updatedProducts = await manager.getProducts({ limit: 100 });
            io.emit("productsUpdate", updatedProducts.docs);
        } catch (error) {
            console.error("Error al eliminar producto via socket:", error);
        }
    });
});

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/ecommerce-final")
    .then(() => {
        console.log("Conectado a la base de datos MongoDB");
        server.listen(PORT, () => {
            console.log(`Server funcionando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Error al conectar a MongoDB", error);
    });