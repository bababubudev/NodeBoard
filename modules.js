import * as Sutukka from "dotenv"
import fs from "fs"
Sutukka.config();

const keys = {
    naam: process.env.NAAM
}

const port_number = 3000;

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

export { keys, port_number };