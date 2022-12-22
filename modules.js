import * as Sutukka from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";

Sutukka.config();

const keys = {
    user: process.env.USER,
    pass: process.env.PSSWD
};

const object_blueprint = {
    linker: { type: String, required: true },
    text: { type: String, required: true },
}

const port_number = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { keys, port_number, __dirname, object_blueprint };