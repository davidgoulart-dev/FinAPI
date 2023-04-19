 const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const customers = []; // Array de clientes
//Middlewares
function verifyIfExistsAccountCPF(request, response, next) {
     const { cpf } = request.headers; // Pega o cpf do cabeçalho da requisição
   
    const customer = customers.find( (customer) => customer.cpf === cpf ); // Procura o cliente no array de clientes
   
    if (!customer) { return response.status(400).json({ error: "Customer not found!" }); } // Verifica se o cliente existe
    
    request.customer = customer; // Adiciona o cliente na requisição

    return next(); // Continua a execução do código

}
function getBalance(statement) {
    const balance = statement.reduce((acc, operation)=> {
        if (operation.type === "credit"){
            return acc + operation.amount;
        }else {
            return acc - operation.amount;
        }
    } , 0);
    return balance;
}
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

app.get( "/statement", verifyIfExistsAccountCPF, (request, response) => { // Retorna o extrato de um cliente
    const { customer } = request; // Pega o cliente da requisição
   
    return response.json(customer.statement); // Retorna o extrato do cliente

} );
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body; // Pega a descrição e o valor da requisição
    const { customer } = request; // Pega o cliente da requisição
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }
    customer.statement.push(statementOperation); // Adiciona a operação no extrato do cliente
    return response.status(201).send("Deposit successfully!");
});
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body; // Pega o valor da requisição
    const { customer } = request; // Pega o cliente da requisição
    const balance = getBalance(customer.statement); // Pega o saldo do cliente
    if (balance < amount) { return response.status(400).json({ error: "Insufficient funds!" }); } // Verifica se o cliente tem saldo suficiente
    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"

    }
    customer.statement.push(statementOperation); // Adiciona a operação no extrato do cliente
    return response.status(201).send("Withdraw successfully!");
} );
app.listen(3333, () => {}); // Inicia o servidor