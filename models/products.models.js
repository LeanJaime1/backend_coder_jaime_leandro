import mongoose from "mongoose";




//Schema (el id se crea automaticamente)
const productSchema = new mongoose.Schema({
    nombre : String
})



//Model

const Product = mongoose.model("Product", productSchema)
