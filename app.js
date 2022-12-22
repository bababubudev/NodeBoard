import express from "express"
import morgan from "morgan"
import * as mods from "./modules.js"

const app = express();

app.set("view engine", "ejs");
app.listen(mods.port_number);

app.use(express.static(mods.__dirname + "/static"));
app.use(morgan("dev"));

app.get("/", on_request);
app.get("/inbox", on_request);
app.use(foreign_redirect);

function on_request(req, res)
{
    let page = "";

    switch (req.url)
    {
        case "/":
            page += "Home";
            break;
        case "/inbox":
            page += "TextPage";
            break;
    }

    res.render(page, { title: page });
}

function foreign_redirect(req, res)
{
    console.log("Request of type " + req.method + " was made outside of scope!");
    res.status(404).render("404", { title: "404 error" });
}