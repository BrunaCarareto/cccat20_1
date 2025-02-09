import crypto from "crypto";
import pgp from "pg-promise";
import express from "express";
import { validateCpf } from "./validateCpf";
import { validatePassword } from "./validatePassword";
import { validateName } from "./validateName";
import { validateEmail } from "./validateEmail";
import { validateCarPlate } from "./validateCarPlate";

const app = express();
app.use(express.json());


app.post("/signup", async function (req, res) {
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	const input = req.body;

	try {
		let result;
		result = await errorsValidation(input, connection, crypto.randomUUID())		
		
		if (typeof result === "number") {
			res.status(422).json({ message: result });
		} else {
			await accountInsert(input, connection, crypto.randomUUID());
			res.json(result);
		}
	
	} finally {
		await connection.$pool.end();
	}
});

async function errorsValidation (input: any, connection:any, id: string) {
	const [accountExists] = await connection.query("select * from ccca.account where email = $1", [input.email]);
	if (accountExists){
		return -4;  // Account exists
	}
	if (!validateName(input.name)) {
		return -3;  // invalid name
	}		
	if (!validateEmail(input.email)) {
		return -2;	// invalid email
	}		
	if (!validatePassword(input.password)) {
		return -5;  // invalid password
	}
	if (!validateCpf(input.cpf)) {		
		return -1;  // invalid cpf
	}	
	if (input.isDriver && !validateCarPlate(input.carPlate)) {
		return -6;  // Invalid car plate
	}		
}

interface request_body {
    name: string;
    email: string;
    cpf: string;
	password: string;	
	// optional fields
    isPassenger?: boolean;
    isDriver?: boolean;
	carPlate?: string;	// carPlate is mandatory when the field 'isDriver' is TRUE
}

async function accountInsert(input: request_body, connection:any, id: string,) {
    await connection.query(
        `INSERT INTO ccca.account 
            (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) 
         VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, input.name, input.email, input.cpf, input.carPlate || null, !!input.isPassenger, !!input.isDriver, input.password]
    );

    return { accountId: id };
}


app.get("/accounts/:accountId", async function (req, res) {
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	const accountId = req.params.accountId;
	const [output] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
	res.json(output);
});


app.listen(3000);
export default app