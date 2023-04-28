const normalize = window.normalizr.normalize;
const schema = window.normalizr.schema;
const denormalize = window.normalizr.denormalize;
let port='';
if (port){
    port =`:${port}`
}
const server ='localhost';
const uri = `http://${server}${port}`;

function checkInputs(fields, type='products'){
    let errorDiv = results;
    let invalide = false;

    if(type=='carts'){
        errorDiv = cartResults;
    }

    fields.forEach((field) => {
            if (field.value === ''){
                field.classList.add('errorInput');
                invalide = true;
            }else{
                field.classList.remove('errorInput');
            }
        })
    if(invalide){
        errorDiv.classList.add('errorLabel');
        errorDiv.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
        return false
    }else{
        fields.forEach((field) => {
            field.classList.remove('errorInput');
        })
        if (errorDiv.classList.contains("errorLabel")) {
            errorDiv.classList.remove("errorLabel");
            errorDiv.innerHTML = "";
          }
        return true
    }
}

//-----------PRODUCTS FORM -------------------------
async function submitForm(graphService = false, id, update = false) {
    let inputFields = [titleInput, codeInput, priceInput, stockInput, thumbnailInput];
    let valideInputs = checkInputs(inputFields, 'products');
    if(valideInputs){
        let newProd = {
            code: codeInput.value,
            title: titleInput.value,
            description: descriptionInput.value,
            price: priceInput.value,
            stock: stockInput.value,
            thumbnail: thumbnailInput.value,
        }
        let newProdGql = `{code: "${codeInput.value}",title: "${titleInput.value}",description: "${descriptionInput.value}",price: ${priceInput.value},stock: ${stockInput.value},thumbnail: "${thumbnailInput.value}"}` 
        let endpoint = graphService ? '/graphql' : '';
        let url = `${uri}/productos${endpoint}`;
        let verb = 'POST';
        (!graphService && id) && (url = url + `/${id}`);
        (!graphService && id) && (verb = 'PUT');
        let data = newProd;
        if(graphService && !update){
            data = { query: `mutation {saveProduct(data:${newProdGql}){id}}`};
        }else if(graphService && update) {
            data = { query: `mutation {updateProduct(id:"${id}", data:${newProdGql}){id}}`};
        }
        // console.log('Body: ', data);
        let response = await fetch(url, { method: verb,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: productRolRadioButton.checked
            },
            body: JSON.stringify(data)
        })
        let prod = graphService ? await response : await response.json();
        console.log('Save response: ', prod);
        if (("error" in prod)){
            results.classList.add('errorLabel');
            results.innerHTML=`<h1>Error</h1>${JSON.stringify(prod.descripcion || prod.error)}</p>`;
            if (prod.error === 'Usuario no autenticado'){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            results.classList.remove('errorLabel');
            socket.emit("productRequest", "msj");
            idInput.value = '';
            [titleInput.value, descriptionInput.value, codeInput.value, priceInput.value, stockInput.value, thumbnailInput.value] = ['','','','','',''];
        }
        // console.log(prod);
    }
}

async function updateProduct(graphService = false, id){
    let inputFields = [titleInput, codeInput, priceInput, stockInput, thumbnailInput, idInput];
    let valideInputs = checkInputs(inputFields, 'products');
    let update = true;
    if (valideInputs){
        // idInput.classList.add('errorInput');
        await submitForm(graphService, id, update);
    }
}

async function getAllProducts(graphService = false){
    // console.log('Cookies: ', document.cookie);
    results.classList.remove('errorLabel');
    let endpoint = graphService ? 'graphql?query={getProducts{id, code, title, description, price, stock, thumbnail}}': '';
    let response = await fetch(`${uri}/productos/${endpoint}`, { method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })
    let prods = await response.json();
    // console.log("Productos: ", prods);
    graphService && (prods = prods.data.getProducts);
    console.log("Lista productos: ", prods);
    if(prods.error === 'Usuario no autenticado'){
        results.classList.add('errorLabel');
        results.innerHTML=`<h1>Error</h1>${JSON.stringify(prods)}</p>`;
        setTimeout(() => {
            location.href=`${uri}/login`
        }, 2000);
    }else{
        results.innerHTML= tableRender(prods);
    }
}

async function getAllRandomProducts(){
    results.classList.remove('errorLabel');
        let response = await fetch(`${uri}/productos-test/`, { method: 'GET',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        let prods = await response.json();
        // console.log("productos: ",prods)
    if ("error" in prods){
        results.classList.add('errorLabel');
        results.innerHTML=`<h1>Error</h1>${JSON.stringify(prods)}</p>`;
        setTimeout(() => {
            location.href=`${uri}/login`
        }, 2000);
    }else{
        results.innerHTML= tableRender(prods);
    }
}

async function getOneProduct(graphService = false, id){
    if (id === ''){
        idInput.classList.add('errorInput');
        results.classList.add('errorLabel');
        results.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }else{
        idInput.classList.remove('errorInput');
        results.classList.remove('errorLabel');
        console.log(id);
        let endpoint = graphService ? `graphql?query={getProduct(id: "${id}"){id, code, title, description, price, stock, thumbnail}}`: `${id}`;
        let response = await fetch(`${uri}/productos/${endpoint}`, { method: 'GET',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        let prod = await response.json();
        // console.log('Producto: ', prod);
        graphService && (prod = {producto:prod.data.getProduct});
        console.log('Producto: ', prod);
        if (("error" in prod)){
            results.classList.add('errorLabel');
            results.innerHTML=`<h1>Error</h1>${JSON.stringify(prod)}</p>`;
            if (prod.error === 'Usuario no autenticado'){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            results.classList.remove('errorLabel');
            results.innerHTML= tableRender(prod.producto);
        }
        // console.log(prod);
    // socket.emit('oneProductRequest', parseInt(id));
    }

}

async function deleteOneProduct(graphService = false, id){
    if (id === ''){
        idInput.classList.add('errorInput');
        results.classList.add('errorLabel');
        results.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }else{
        idInput.classList.remove('errorInput');
        results.classList.remove('errorLabel');
        let endpoint = graphService ? `graphql` : `${id}`;
        let verb = graphService ? 'POST' : 'DELETE';
        let data = graphService ? {query : `mutation {deleteProduct(id:"${id}"){id}}`} : {};
        // console.log('Body: ', data);
        let response = await fetch(`${uri}/productos/${endpoint}`, { method: verb,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: productRolRadioButton.checked
            },
            body: JSON.stringify(data)
        })
        let prod = await response.json();
        console.log('Producto eliminado: ', prod);
        if (("error" in prod)){
            console.log("Error", prod);
            results.classList.add('errorLabel');
            results.innerHTML=`<h1>Error</h1>${JSON.stringify(prod.descripcion || prod.error)}</p>`;
            if (prod.error === 'Usuario no autenticado'){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            console.log("Producto eliminado: ", prod);
            results.classList.remove('errorLabel');
            socket.emit("productRequest", "msj");
            idInput.value = '';
        }
    }
}


//---------CARTS FORM----------------------------------

async function saveCart(user){
    if(user===''){
        cartUserInput.classList.add('errorInput');
        cartResults.classList.add('errorLabel');
        cartResults.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }else{
        let newCart = {
            usuario: user,
            productos: []
        }
        cartResults.classList.remove('errorLabel');
        cartUserInput.classList.remove('errorInput');
        idCartInput.classList.remove('errorInput');
        idProdInput.classList.remove('errorInput');
        let response = await fetch(`${uri}/carrito/?`, { method: 'POST',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: true 
            },
            body: JSON.stringify(newCart)
        })
        let carts = await response.json();
        console.log("Nuevo carrito: ", carts)
        if (carts.error === 'Usuario no autenticado'){
            cartResults.classList.add('errorLabel');
            cartResults.innerHTML=`<h1>Error</h1>${JSON.stringify(carts)}</p>`;
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
        }else{
            // results.innerHTML= tableRender(carts);
            cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>NuevoCarrito: <br></strong>${JSON.stringify(carts)}</p>`;
            cartUserInput.value = '';
            idCartInput.value = '';
            idProdInput.value = '';
        }
    }
}

async function saveProdInCart(idCart){
    let inputFields = [titleInput, codeInput, priceInput, stockInput, thumbnailInput];
    let valideInputs = checkInputs(inputFields, 'products');
    if((valideInputs && idCart !== '')){
        let newProd = {
                code: codeInput.value,
                title: titleInput.value,
                description: descriptionInput.value,
                price: priceInput.value,
                stock: stockInput.value,
                thumbnail: thumbnailInput.value,
                }
        cartResults.classList.remove('errorLabel');
        cartUserInput.classList.remove('errorInput');
        idCartInput.classList.remove('errorInput');
        idProdInput.classList.remove('errorInput');
        let response = await fetch(`${uri}/carrito/${idCart}/productos`, { method: 'POST',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: true
            },
            body: JSON.stringify(newProd)
        })
        let carts = await response.json();
        console.log("Nuevo carrito: ",carts);
        if (carts.error){
            cartResults.classList.add('errorLabel');
            cartResults.innerHTML=`<h1>Error</h1>${JSON.stringify(carts)}</p>`;
            if(carts.error === 'Usuario no autenticado'){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            // results.innerHTML= tableRender(carts);
            cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>CarritoActualizado: <br></strong>${JSON.stringify(carts)}</p>`;
            cartUserInput.value = '';
            idCartInput.value = '';
            idProdInput.value = '';
            [titleInput.value, descriptionInput.value, codeInput.value, priceInput.value, stockInput.value, thumbnailInput.value] = ['','','','','',''];
        }
    }else{
        idCartInput.classList.add('errorInput');
        cartResults.classList.add('errorLabel');
        cartResults.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }
}

async function getAllCarts(){
    cartResults.classList.remove('errorLabel');
    idCartInput.classList.remove('errorInput');
    idProdInput.classList.remove('errorInput');
    let response = await fetch(`${uri}/carrito/?`, { method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })
    let carts = await response.json();
    console.log("Carritos: ",carts)
    if (carts.error === 'Usuario no autenticado'){
        cartResults.classList.add('errorLabel');
        cartResults.innerHTML=`<h1>Error</h1>${JSON.stringify(carts)}</p>`;
            setTimeout(() => {
                location.href=`${uri}/login`
            }, 2000);
    }else{
    // results.innerHTML= tableRender(carts);
    cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>Carritos: <br></strong>${JSON.stringify(carts)}</p>`;
    idCartInput.value = '';
    idProdInput.value = '';
    [titleInput.value, descriptionInput.value, codeInput.value, priceInput.value, stockInput.value, thumbnailInput.value] = ['','','','','',''];
    }
}

async function getOneCart(id){
    if (id === ''){
        idCartInput.classList.add('errorInput');
        cartResults.classList.add('errorLabel');
        cartResults.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }else{
        idCartInput.classList.remove('errorInput');
        idProdInput.classList.remove('errorInput');
        cartResults.classList.remove('errorLabel');
        let response = await fetch(`${uri}/carrito/${id}/productos`, { method: 'GET',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        let cart = await response.json();
        if (("error" in cart)){
            cartResults.classList.add('errorLabel');
            cartResults.innerHTML=`<h1>Error</h1>${JSON.stringify(cart)}</p>`;
            if (cart.error === "Usuario no autenticado"){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            cartResults.classList.remove('errorLabel');
            // cartResults.innerHTML= tableRender(prod.producto);
            cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>ProductosCarrito${id}: <br></strong>${JSON.stringify(cart)}</p>`;
            idCartInput.value = '';
        }
        idProdInput.value = '';
        console.log(cart);
        return cart;
        // socket.emit('oneProductRequest', parseInt(id));
    }
}



async function deleteOneProductInCart(idCart, idProd){
    if (idCart === '' || idProd === ''){
        idCartInput.classList.add('errorInput');
        idProdInput.classList.add('errorInput');
        cartResults.classList.add('errorLabel');
        cartResults.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }else{
        idCartInput.classList.remove('errorInput');
        idProdInput.classList.remove('errorInput');
        cartResults.classList.remove('errorLabel');
        cartResults.classList.remove('errorLabel');
        let response = await fetch(`${uri}/carrito/${idCart}/productos/${idProd}`, { method: 'DELETE',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: true
            }
        })
        let prod = await response.json();
        if (("error" in prod)){
            console.log("Error", prod);
            cartResults.classList.add('errorLabel');
            cartResults.innerHTML=`<h1>Error</h1>${JSON.stringify(prod)}</p>`;
            if (prod.error === "Usuario no autenticado"){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            console.log("Producto eliminado: ", prod);
            cartResults.classList.remove('errorLabel');
            cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>ProductoEliminadoDelCarrito${idCart}: <br></strong>${JSON.stringify(prod)}</p>`;
            // socket.emit("productRequest", "msj");
            idCartInput.value = '';
            idProdInput.value = '';
        }
    }
}

async function deleteOneCart(id){
    if (id === ''){
        idCartInput.classList.add('errorInput');
        cartResults.classList.add('errorLabel');
        cartResults.innerHTML=`<p>Los campos resaltados son obligatorios</p>`;
    }else{
        idCartInput.classList.remove('errorInput');
        idProdInput.classList.remove('errorInput');
        cartResults.classList.remove('errorLabel');
        let response = await fetch(`${uri}/carrito/${id}`, { method: 'DELETE',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: true
            }
        })
        let cart = await response.json();
        if (("error" in cart)){
            console.log("Error", cart);
            cartResults.classList.add('errorLabel');
            cartResults.innerHTML=`<h1>Error</h1>${JSON.stringify(cart)}</p>`;
            if (cart.error === "Usuario no autenticado"){
                setTimeout(() => {
                    location.href=`${uri}/login`
                }, 2000);
            }
        }else{
            console.log("Carrito eliminado: ", cart);
            cartResults.classList.remove('errorLabel');
            // socket.emit("productRequest", "msj");
            cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>Carrito${id}Eliminado: <br></strong>${JSON.stringify(cart)}</p>`;
            idCartInput.value = '';
            idProdInput.value = '';
        }
    }
}

async function buyCart(id){
    let valideInputs = checkInputs([idCartInput], 'carts')
    if (valideInputs){
        let response = await fetch(`${uri}/carrito/${id}/productosCompra`, { method: 'POST',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Auth: true
            }
        })
        let resp = await response.json();
        let cart = resp[0];
        console.log(resp);
        if(!("error" in cart)){
            cartResults.classList.remove('errorLabel');
            cartResults.innerHTML=`<h1>Respuesta</h1><p><strong>Se ha registrado la compra de los siguientes productos: <br></strong>${JSON.stringify(cart)}</p>`
        }else{
            cartResults.classList.add('errorLabel');
            cartResults.innerHTML=`<h1>Error</h1><p><strong>Se ha presentado error durante la compra: <br></strong>${JSON.stringify(cart)}</p>`
        }
    }
}

//-----------MESSAGES----------------------------------------
async function sendMessage(graphService = false) {
    const fields = [userInput, msgInput];
    let valideInputs = checkInputs(fields, 'messages');
    if(valideInputs){
        let newMessage = {
            // fecha: new Date().toLocaleString("en-GB"),
            fecha: new Date(),
            usuario: userInput.value,
            mensaje: msgInput.value
        }
        let newMessageGql = `{fecha: ${JSON.stringify(new Date())},usuario: "${userInput.value}",mensaje: "${msgInput.value}"}`;
        let endpoint = graphService ? '/graphql' : '';
        let url = `${uri}/mensajes${endpoint}`;
        let verb = 'POST';
        let newMsg = graphService ? { query: `mutation {saveMessage(data:${newMessageGql}){id}}`} : newMessage;
        let response = await fetch(url, { method: verb,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newMsg)
        })
        // console.log('Body: ', newMsg);
        let data = await response.json();
        !("error" in data) && ([msgInput.value] = ['']);
        // console.log(data);

        if (data?.error === "Usuario no autenticado"){
            console.log("Error", data);
            results.classList.add('errorLabel');
            results.innerHTML=`<h1>Error</h1>${JSON.stringify(data)}</p>`;
            setTimeout(() => {
                location.href=`${uri}/login`
            }, 2000);
        }else{
            socket.emit('messageRequest','msj')
        }
    }
}

function normalizeMessage(msg){
    const authorSchema = new schema.Entity('authorSchema',{}, {idAttribute: 'id'});
    const messageSchema = new schema.Entity('messageSchema',{
        author: authorSchema
    }, {idAttribute: 'author'})
    const msgsSchema = new schema.Entity('msgsSchema',{
        messages: [messageSchema]
    }, {idAttribute: 'messages'} );
    const normalizedMessage = normalize(msg, msgsSchema);
    const denormalizedMessage = denormalize(normalizedMessage.result, msgsSchema, normalizedMessage.entities);
    return [normalizedMessage, denormalizedMessage];
}

function createMessage() {
    let newMessage = {
        type: 'msgList',
        messages: [
            {
                author: {
                    id: userIdInput.value,
                    nombre: userInput.value,
                    apellido: userLastnameInput.value,
                    edad: userAgeInput.value,
                    alias: userAliasInput.value,
                    avatar: userAvatarInput.value
                },
                fecha: new Date(),
                // fecha: new Date().toLocaleString("en-GB"),
                mensaje: msgInput.value
            }
        ]
    } 
    return newMessage
}

async function sendNormalizedMessage() {
    const fields = [userIdInput, userInput, userLastnameInput, userAgeInput, userAliasInput, userAvatarInput, msgInput];
    let valideInputs = checkInputs(fields, 'messages');

    if(valideInputs){
        let newMessage = createMessage();
        // let newMessageStr = JSON.stringify(newMessage)
        // console.log('OriginalMsgStr', newMessageStr);
        console.log('OriginalMsg', newMessage);
        let [normMessage, denormMessage] = normalizeMessage(newMessage);
        console.log('normMsg', normMessage);
        console.log('denormMsg', denormMessage);
        // console.log('Normalized Again', normalizeMessage(denormMessage)[0] )
        let url = `${uri}/mensajes/normalized`;
        let verb = 'POST';
        let response = await fetch(url, { method: verb,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(normMessage)
        })
        let data = await response.json();
        !("error" in data) && ([msgInput.value] = ['']);
        // console.log(data);
        if (data?.error === "Usuario no autenticado"){
            console.log("Error", data);
            results.classList.add('errorLabel');
            results.innerHTML=`<h1>Error</h1>${JSON.stringify(data)}</p>`;
            setTimeout(() => {
                location.href=`${uri}/login`
            }, 2000);
        }else{
            socket.emit('normMessageRequest','msj')
        }
    }
}

async function logout(){

    let response = await fetch(`${uri}/login`, { method: 'DELETE',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    })
    let resp = await response.json();
    if (resp.user){
        let user = resp.user;
        console.log('LogoutUser', user);
        // document.body.innerHTML = `<h1>HASTA LUEGO ${user}</h1>`
        // alert("HASTA LUEGO "+ resp.user);
        location.href=`${uri}/logout/${user}`
    }else{
        location.href=`${uri}/login`
    }

}


//------USER------------------------
logoutButton.addEventListener('click', () => logout())
//------PRODUCTS FORM---------------------------
submitButton.addEventListener('click', () => submitForm(productServiceRadioButton.checked))
getOneButton.addEventListener('click', () => getOneProduct(productServiceRadioButton.checked, idInput.value))
updateButton.addEventListener('click', () => updateProduct(productServiceRadioButton.checked, idInput.value))
deleteOneButton.addEventListener('click', () => deleteOneProduct(productServiceRadioButton.checked, idInput.value))
getAllButton.addEventListener('click', () => getAllProducts(productServiceRadioButton.checked))
getAllRandomButton.addEventListener('click', getAllRandomProducts)
//------CARTS FORM-----------------------------------

saveCartButton.addEventListener('click', () => saveCart(cartUserInput.value))
saveProdInCartButton.addEventListener('click', () => saveProdInCart(idCartInput.value))
getAllCartsButton.addEventListener('click', getAllCarts)
getCartButton.addEventListener('click', () => getOneCart(idCartInput.value))
deleteProductInCartButton.addEventListener('click', () => deleteOneProductInCart(idCartInput.value, idProdInput.value));
deleteCartButton.addEventListener('click', () => deleteOneCart(idCartInput.value))
buyCartButton.addEventListener('click', () => buyCart(idCartInput.value))

//-------MESSAGES------------------------------------
sendNormMsgButton.addEventListener('click', () => sendNormalizedMessage())
sendMsgButton.addEventListener('click', () => sendMessage(productServiceRadioButton.checked))