import * as Sutukka from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";

Sutukka.config();

const keys = {
    naam: process.env.NAAM,
    thegana: process.env.THEGANA
}

const port_number = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function read_write(url, response)
{
    fs.readFile(url, (err, data) =>
    {
        if (err)
        {
            console.log(err);
            response.end();
        }
        else
        {
            response.write(data);
            response.end();
        }
    });
}

export { keys, port_number, __dirname };