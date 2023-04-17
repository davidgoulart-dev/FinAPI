 const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const customers = []; // Array de clientes
app.use( express.json() );
app.post('/account', (request, response) => { // Cria uma conta
    const { cpf, name } = request.body;
    
    const customerAlreadyExists = customers.some( (customer) => customer.cpf === cpf );
    
    if (customerAlreadyExists) { return response.status(400).json({ error: "Customer already exists!" }); }
     // Verifica se o cliente já existe
    

    customers.push({ // Adiciona o cliente no array
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });
    return response.status(201).send("Account created successfully!"); 


});

app.get( "/statement/:cpf", (request, response) => { // Retorna o extrato de um cliente
   
    const { cpf } = request.params; // Pega o cpf da url
   
    const customer = customers.find( (customer) => customer.cpf === cpf ); // Procura o cliente no array de clientes
   
    return response.json(customer.statement); // Retorna o extrato do cliente

} );
app.listen(3333, () => {}); // Inicia o servidor