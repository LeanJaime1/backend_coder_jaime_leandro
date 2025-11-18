const boton = document.querySelector('button')
console.log(io)

const conexionDelFront = io()


conexionDelFront.on("connect", ()=>{
    console.log("conectado al servidor")
})

boton.addEventListener("click", ()=>{
    console.log("Enviando mensaje")
    conexionDelFront.emit("mensaje","hola desde el front")
})