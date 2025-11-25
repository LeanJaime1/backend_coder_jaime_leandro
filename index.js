import express from "express"
import http from "http"
import { Server } from "socket.io"
import handlebars from "express-handlebars"
import fs from "fs/promises"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import mongoose from "mongoose"
import { ProductManager } from "./class/productManager.js"
import { CartManager } from "./class/cartManager.js"


//SERVIDORES
const server = express()
const servidor = http.createServer(server)
const servidorWS = new Server(servidor)

servidorWS.on("connection", (socket)=>{
    console.log('Nuevo cliente conectado')

    socket.on("mensaje",()=>{
        socket.emit("respuesta" , "Hola desde el servidor")
    })

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




//conf server
const PORT = 8080

//middleware
server.use(express.json())
server.use(express.static("public"))

const PRODUCTS_FILE ='products.json';
const CARTS_FILE = './carts.json';


//Instancias de clases
export const manager = new ProductManager()

export const cartManager = new CartManager(CARTS_FILE);

//RUTAS

//products
server.use("/", productRouter)
//carts
server.use("/api/carts", cartRouter)


//MongoDB
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


