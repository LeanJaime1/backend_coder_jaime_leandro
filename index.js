import express from "express"
import http from "http"
import { Server } from "socket.io"
import handlebars from "express-handlebars"
import productRouter from "./routes/product.routes.js" 
import cartRouter from "./routes/cart.routes.js"
import mongoose from "mongoose"
import { ProductManager } from "./class/productManager.js"
import { CartManager } from "./class/cartManager.js"


//SERVIDORES
const server = express()
const servidor = http.createServer(server)
const servidorWS = new Server(servidor)

const PRODUCTS_FILE ='products.json';
const CARTS_FILE = './carts.json';


//Instancias de clases
export const manager = new ProductManager(PRODUCTS_FILE)

export const cartManager = new CartManager(CARTS_FILE);


//WebSockets
servidorWS.on("connection", async (socket) => {

    const products = await manager.getProducts();
    socket.emit('productsUpdate', products);

    socket.on('addProduct', async (productData) => {
        try {
            if (!productData) throw new Error("Datos vacíos");
            await manager.addProduct(productData);
            
            const updatedProducts = await manager.getProducts();
            servidorWS.emit('productsUpdate', updatedProducts);
            console.log("--> SERVER: Producto agregado.");
        } catch (error) {
            console.error("--> SERVER ERROR:", error.message);
        }
    });

  


    socket.on('deleteProduct', async (id) => {
        try {
            
            const idNumber = parseInt(id); 
            
            await manager.deleteProduct(idNumber);
            
         
            const updatedProducts = await manager.getProducts();
            servidorWS.emit('productsUpdate', updatedProducts);
            
            console.log(`--> SERVER: Producto con ID ${idNumber} eliminado.`);
        } catch (error) {
            console.error("--> SERVER ERROR AL ELIMINAR:", error.message);
        }
    });
})


const socketIoMiddleware = (req, res, next) => {
    req.io = servidorWS; 
    next();
};


server.use(socketIoMiddleware);

//server.engine("handlebars", motor)
server.engine('handlebars', handlebars.engine())
//server.set("view engine", "handlebars")
server.set('view engine','handlebars')
server.set('views', './views')


//conf server
const PORT = 8080

//middleware
server.use(express.json())
server.use(express.urlencoded({ extended: true })) 
server.use(express.static("public"))


//RUTAS

//products
server.use("/", productRouter)
//carts
server.use("/api/carts", cartRouter)


//Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/demo-db-1")
.then(()=>{
    console.log("conectado a la base de datos")
    servidor.listen(PORT, ()=>{
    console.log(`Server funcionando en el puerto ${PORT}`)
})
})
.catch((error)=>{
    console.log("error", error)
})