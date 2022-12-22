import express from "express"
import * as mods from "./modules.js"

const app = express();

app.listen(mods.port_number);

app.get("/", on_request);
app.get("/inbox", on_request);
app.use(on_use);


function on_request(req, res)
{
    let path = "./views/";

    switch (req.url)
    {
        case "/":
            path += "base.html";
            break;
        case "/inbox":
            path += "customarea.html";
            break;
    }

    console.log("Request of type " + req.method + " was made!");
    res.sendFile(path, { root: mods.__dirname });
}

function on_use(req, res)
{
    console.log("Request of type " + req.method + " was made outside of scope!");
    res.sendFile("./views/404.html", { root: mods.__dirname });
}