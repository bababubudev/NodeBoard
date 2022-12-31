import path from "path"
import { fileURLToPath } from "url";
import * as Sutukka from "dotenv"

Sutukka.config();

const keys = {
    user: process.env.USER,
    pass: process.env.PSSWD
};

const object_blueprint = {
    linker: { type: String, required: true },
    text: { type: String, required: false },
}

const object_session = {
    secret: process.env.S_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 30
    }
}

const object_default = {
    _id: 0,
    linker: "User",
    text: "",
    createdAt: null,
    updatedAt: null
}

const port_number = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function stringed(_data)
{
    return JSON.stringify(_data);
}

export
{
    keys, port_number, __dirname,
    object_blueprint, object_session, object_default
};