import express from "express"
import fs from "fs/promises"

const server = express()

const PORT = 8080

server.use(express.json())


//CLASES

//productManager
class ProductManager {
    constructor(){
        
    }
     
    

    async verProductsAsync () {
            try {
            const data = await fs.readFile('products.txt',{ encoding:'utf-8'} )
            return data
        }   catch  {
            console.log('Hubo un error')
        }
    }

   async crearNewProductAsync(file,content){
        try {
            await fs.writeFile(file, content)
            console.log('se creo el archivo correctamente!')
            
        } catch{ 
            console.log('Hubo un error!!')
        }
    }


}
const manager = new ProductManager()



//cartManager
class CartManager {
     constructor(path){
        this.path = path;
     }
   

    async readCarts (){
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            
            if (data.trim() === '') {
                return [];
            }
            
            return JSON.parse(data);
            
        } catch (error) {
           
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error; 
        }
    }



     async createCarts (){
        const carts = await this.readCarts()

        let newId
        if (carts.length === 0){
            newId = 1

        }   else {
            newId = carts[carts.length -1].id + 1
        }

        const newCart = {
            id: newId,
            products : []
        }

        carts.push(newCart)

        const cartsStringified = JSON.stringify(carts)
        await fs.writeFile(this.path, cartsStringified)
        return newCart
        

        
}
}


const cartManager = new CartManager('./carts.txt');



//RUTAS


//ruta de get

server.get('/api/products', (req,res)=>{
  const data =   manager.verProductsAsync()
  data
        .then((respuesta)=>{
            res.send(respuesta)
        })
        .catch(()=>{
            res.send('Hubo un error!')
        })

    console.log('Ruta con get') ;   

})



//ruta de post

server.post('/api/products', (req,res)=>{
    
    console.log(req.body)
    
    const fileName= req.body.file
    const contentToSave = JSON.stringify(req.body)
    
    const data =   manager.crearNewProductAsync(fileName,contentToSave)
    data
        .then((respuesta)=>{
            res.send(respuesta)
        })
        .catch(()=>{
            res.send('Hubo un error!')
        })
    
    console.log('Ruta con post')

})





//ruta post para carrito

server.post('/api/carts', async (req,res)=>{
    try {
        const newCart = await cartManager.createCarts()
        res.send(newCart)
    } catch (error) {
        console.log('Error al crear el carrito')

    }
    
})








server.listen(PORT, ()=>{
    console.log(`Server funcionando en el puerto ${PORT}`)
})