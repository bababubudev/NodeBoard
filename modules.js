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
    time_id: { type: String, required: false }
}

const object_session = {
    secret: process.env.S_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: null
    }
}

const object_default = {
    _id: 0,
    linker: "it's the wrong page",
    text: "",
    time_id: "",
    createdAt: null,
    updatedAt: null
}

const port_number = process.env.PORT || 3000;

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
        case "no-opt":
            return null;
        case "m-five":
            return 5 * minutes;
        case "h-five":
            return 5 * hours;
        case "d-one":
            return days;
        case "d-five":
            return 5 * days;
        case "d-ten":
            return 10 * days;
        default:
            console.log("Default");
            return minutes;
    }
}

export function parse_timeID(time_id)
{
    switch (time_id)
    {
        case "no-opt":
            return "ever";
        case "m-five":
            return "five minutes";
        case "h-five":
            return "five hours";
        case "d-one":
            return "a day";
        case "d-five":
            return "five days";
        case "d-ten":
            return "ten days";
        default:
            console.log("Default");
            return minutes;
    }
}

export function is_link(text)
{
    const urlRegex = /^(?:(?:https?|ftp):\/\/)?(?:[\w-]+(?:\.[\w-]+)+)(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    return urlRegex.test(text);
}

export function get_clickable(link)
{
    return link.startsWith("http://") || link.startsWith("https://") ?
        link : `http://${link}`;
}

export
{
    keys, port_number, __dirname,
    object_blueprint, object_session, object_default
};