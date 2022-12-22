import express from "express"
import morgan from "morgan"
import mongoose from "mongoose"

import { Redirect } from "./models/redirects.js"
import * as mods from "./modules.js"

const app = express();
const dbURI = `mongodb+srv://dai:${mods.keys.pass}@daiko.wo85kxg.mongodb.net/nodeboard_db?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(dbURI).then(on_connect).catch(on_fail);

app.set("view engine", "ejs");

app.use(express.static(mods.__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", on_request);
app.get("/inbox", on_request);

app.post("/inbox", on_post).then((result) => { res.redirect("/inbox") }).catch((err) => { console.log(err) });
app.use(foreign_redirect);

function on_connect(result)
{
    console.log("Connected to the database.");
    app.listen(mods.port_number);
}

function on_fail(err)
{
    console.log("Failed to connect to the database.");
}

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

function on_post(req, res)
{

}