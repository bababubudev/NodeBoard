import * as mods from "./modules.js"
import http from "http"

const server = http.createServer(on_request);
server.listen(mods.port_number, "localhost", on_listen);

function on_request(req, res)
{
    console.log("Request of type " + req.method + " was made!");
    res.setHeader("Content-Type", "text/html");

    let path = "./views/";

    switch (req.url)
    {
        case "/":
            path += "base.html";
            break;
        case "/inbox":
            path += "customarea.html";
            break;
        default:
            path += "404.html";
            res.statusCode = 404;
            break;
    }

    mods.read_write(path, res);
}

function on_listen()
{
    console.log("Listening on port " + mods.port_number);
}