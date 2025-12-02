import mongoose from "mongoose";
import validator from "validator"




//Schema (el id se crea automaticamente)
const productSchema = new mongoose.Schema({
    nombre : {
        type : String,
        required : true,
    },
    edad : {
        type : Number,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
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



