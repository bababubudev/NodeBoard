import * as Sutukka from "dotenv"
Sutukka.config();

const keys = {
    naam: process.env.NAAM
}

const user = {
    name: "Prabesh",
}

export { keys, user }