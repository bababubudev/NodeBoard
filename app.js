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

app.get("/", on_get);
app.get("/inbox", on_get);

app.post("/", on_post);
app.post("/inbox", on_inbox_post);
app.use(foreign_redirect);

function on_connect(result)
{
    mods.log("Connected to the database.");
    app.listen(mods.port_number);
}

function on_fail(err)
{
    mods.log("Failed to connect to the database.\n" + err);
}

function on_get(req, res)
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
        default:
            page += "404";
            break;
    }

    if (req.session.data)
    {
        let is_synced = false;
        Redirect.findOne({ linker: req.session.data["linker"] })
            .then((r) =>
            {
                mods.log("Database: " + r.createdAt + "\nSession: " + req.session.data["createdAt"]);
                is_synced = r.updatedAt === req.session.data["updatedAt"];
            });

        mods.log("Database session name: " + req.session.data["linker"]);
        mods.log("Database session text: " + req.session.data["text"]);
        mods.log("Is synced: " + is_synced);
        res.render(page, { title: page, info: req.session.data });
    }
    else
    {
        mods.log("No sessions found!");
        res.render(page, { title: page, info: mods.object_default });
    }
}

function foreign_redirect(req, res)
{
    res.status(404).render("404", { title: "404 error" });
}

function on_post(req, res)
{
    let link = req.body.userlink;

    if (req.session.data && link != req.session.data["linker"])
        logout(req);

    Redirect.findOne({ linker: link })
        .then((result) =>
        {
            if (result != null)
            {
                req.session.data = result;
                console.log("[ Output ]\n" + result);
                res.redirect("/inbox");
            }
            else
            {
                const new_user = new Redirect({ linker: link, text: "" });
                new_user.save()
                    .then((s_result) =>
                    {
                        mods.log("[ New Output ]\n" + s_result);
                        req.session.data = s_result;
                        res.redirect("/inbox");
                    })
                    .catch((err) =>
                    {
                        mods.log("Error: \n" + err);
                        res.redirect("/");
                    });
            }
        })
        .catch((err) =>
        {
            mods.log("Error: \n" + err);
            res.redirect("/");
        });

}

function on_inbox_post(req, res)
{
    let text = req.body.textinput;

    if (!req.session.data)
    {
        res.redirect("/");
        return;
    }

    Redirect.findOne({ linker: req.session.data["linker"] })
        .then((result) =>   
        {
            if (result["text"] === text)
            {
                res.redirect("/inbox");
                return;
            }

            result["text"] = text;

            result.save()
                .then((s_result) =>
                {
                    mods.log("[ New Text ]\n" + s_result);
                    req.session.data = s_result;

                    res.redirect("/inbox");
                })
                .catch((err) =>
                {
                    mods.log("Error: \n" + err);
                    res.redirect("/");
                });

        })
        .catch((err) =>
        {
            mods.log("Error \n" + err);
        });

}

function logout(request)
{
    let link = request.session.data["linker"];

    request.session.data = mods.object_default;
    mods.log("Session value " + link + " destroyed!");
}