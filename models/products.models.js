import mongoose from "mongoose";
import validator from "validator"




//Schema (el id se crea automaticamente)
const productSchema = new mongoose.Schema({
    nombre : String,
    edad : Number,
    email : {
        type : String,
        validate : {
            validator : (valor) => {
                const esValido = validator.isEmail(valor)
                console.log("esValido", esValido)

                return esValido;
            },
            message : ""
        } 
     }
})
 


//Model

const ProductModel = mongoose.model("Product", productSchema)


export default ProductModel;
