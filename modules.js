import path from "path"
import { fileURLToPath } from "url";
import * as Sutukka from "dotenv"

Sutukka.config();

const seconds = 1000;
const minutes = seconds * 60;
const hours = minutes * 60;
const days = hours * 24;

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
        maxAge: 1000 * 60 * 5
    }
}

const object_default = {
    _id: 0,
    linker: "User",
    text: "",
    createdAt: null,
    updatedAt: null
}

const port_number = 6969;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function stringed(_data)
{
    return JSON.stringify(_data);
}

export function parse_time(timer)
{
    switch (timer)
    {
        case "h-five":
            return 5 * hours;
        case "d-one":
            return days;
        case "d-ten":
            return 10 * days;
        case "m-one":
            return 30 * days;
        default:
            console.log("Default");
            return minutes;
    }
}

export
{
    keys, port_number, __dirname,
    object_blueprint, object_session, object_default
};