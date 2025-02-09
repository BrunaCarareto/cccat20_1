import request from "supertest"
import app from "../src/signup"
import pgp from "pg-promise";

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

let request_body = {
    name: "Bruna Ramos",
    email: "bruna@hotmail.com",
    password: "A1b2c3d4",
    cpf: "97456321558",
    isDriver: false,
    carPlate: ""
}

async function removerDadosCadastradosNoTeste(email: string): Promise<void> {
    await connection.query(`delete from ccca.account where email = '${email}'`)
}

afterEach(async () =>{
    await removerDadosCadastradosNoTeste(`${request_body.email}`)

    // Restaurar bons dados antes de começar o proximo teste    
    request_body = {
        name: "Bruna Ramos",
        email: "bruna@hotmail.com",
        password: "A1b2c3d4",
        cpf: "97456321558",
        isDriver: false,
        carPlate: ""
    }
})

describe("Casos de Teste do endpoint POST", () => {

    it("Sucesso - cadastro simples", async () => {
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(200)

        // verificar dados inseridos no banco
        const db_response = await connection.query(`select count(*) from ccca.account where email = '${request_body.email}'`)
        expect(Number(db_response[0].count)).toBe(1);
    })

    it("Sucesso - cadastro de motorista", async () => {
        request_body.isDriver = true
        request_body.carPlate = "AAA1234"
        
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(200)

        // verificar dados inseridos no banco
        const db_response = await connection.query(`select count(*) from ccca.account where email = '${request_body.email}'`)
        expect(Number(db_response[0].count)).toBe(1);
    })

    it("Erro ao cadastrar - email duplicado", async () => {
        let api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(200)
        api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(422)
    })

    it("Erro ao cadastrar - email invalido", async () => {
        request_body.email = "email_invalido"
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(422)
        expect(api_response.text).toBe("{\"message\":-2}")
    })

    it("Erro ao cadastrar - placa invalida", async () => {
        request_body.isDriver = true
        request_body.carPlate = "a1"
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(422)
        expect(api_response.text).toBe("{\"message\":-6}")
    })

    it("Erro ao cadastrar - cpf invalido", async () => {
        request_body.cpf = "cpf_invalido"
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(422)
        expect(api_response.text).toBe("{\"message\":-1}")
    })

    it("Erro ao cadastrar - senha invalida", async () => {
        request_body.password = "senha_invalida"
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(422)
        expect(api_response.text).toBe("{\"message\":-5}")
    })

    it("Erro ao cadastrar - nome invalido", async () => {
        request_body.name = "invalido"
        const api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(422)
        expect(api_response.text).toBe("{\"message\":-3}")
    })
})


describe("Casos de Teste do endpoint GET", () => {
    
    it("Sucesso ao buscar registro no banco de dados", async () => {
        // inserindo novo registro no banco de dados
        let api_response = await request(app).post("/signup").send(request_body)
        expect(api_response.statusCode).toBe(200)

        // buscando o ID inserido no banco de dados
        const db_response = await connection.query(`select account_id from ccca.account where email = '${request_body.email}'`)
        const id = db_response[0].account_id

        // testando o endpoint GET
        api_response = await request(app).get(`/accounts/${id}`)
        expect(api_response.statusCode).toBe(200)
        expect(api_response.body.name).toBe(`${request_body.name}`)
        expect(api_response.body.email).toBe(`${request_body.email}`)
        expect(api_response.body.cpf).toBe(`${request_body.cpf}`)
        expect(api_response.body.password).toBe(`${request_body.password}`)
    })

})