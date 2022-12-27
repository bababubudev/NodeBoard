import express from "express"
import morgan from "morgan"
import mongoose from "mongoose"
import session from "express-session"

import { Redirect } from "./models/redirects.js"
import * as mods from "./modules.js"

const app = express();
const dbURI = `mongodb+srv://dai:${mods.keys.pass}@daiko.wo85kxg.mongodb.net/nodeboard_db?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(dbURI).then(on_connect).catch(on_fail);

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(express.static(mods.__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(session(mods.object_session));
app.use(morgan("dev"));

app.get("/", on_request);
app.get("/inbox", on_request);

app.post("/inbox", on_post);
app.use(foreign_redirect);

function on_connect(result)
{
    console.log("Connected to the database.");
    app.listen(mods.port_number);
}

function on_fail(err)
{
    console.log("Failed to connect to the database.\n" + err);
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

    console.log("Session from on_request: " + req.session.link);
    res.render(page, { title: page, info: req.session.link });
}

function foreign_redirect(req, res)
{
    res.status(404).render("404", { title: "404 error" });
}

function on_post(req, res)
{
    let link = req.body.userlink;

    if (req.session.link && link != req.session.link)
        logout(req);

    Redirect.findOne({ linker: link })
        .then((result) =>
        {
            if (result != null)
            {
                req.session.link = link;
                req.session.mal = result;
                console.log("[ Output ]\n" + result);
            }

            console.log("Link: " + req.session.link);
            console.log("User: " + req.session.mal.linker);

            res.redirect("/inbox");
        })
        .catch((err) =>
        {
            console.log(err);
        });
}

function logout(request)
{
    let link = request.session.link;
    request.session.link = "User";
    console.log("Session value " + link + " destroyed!");
}