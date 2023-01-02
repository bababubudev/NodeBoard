import express from "express"
import morgan from "morgan"
import mongoose from "mongoose"
import session from "express-session"
import flash from "connect-flash"

import { Redirect } from "./models/redirects.js"
import * as mods from "./modules.js"

const app = express();
const dbURI = `mongodb+srv://${mods.keys.user}:${mods.keys.pass}@${mods.keys.user}.wo85kxg.mongodb.net/nodeboard_db?retryWrites=true&w=majority`;

const timers = []

let time_id = "";
let prev_t;

mongoose.set("strictQuery", false);
mongoose.connect(dbURI).then(on_connect).catch(on_fail);

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(express.static(mods.__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(session(mods.object_session));
app.use(morgan("dev"));
app.use(flash());

app.get("/", on_get);
app.get("/inbox", on_get);

app.post("/", on_post);
app.post("/inbox", on_inbox_post);
app.use(foreign_redirect);

function on_connect(result)
{
    console.log("Connected to the database.");
    app.listen(mods.port_number)
}

function on_fail(err)
{
    console.log("Failed to connect to the database.\n" + err);
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
        sync_session(req)
            .then(() =>
            {
                console.log("Database session name: " + req.session.data["linker"]);
                console.log("Is a link: " + mods.is_link(req.session.data["text"]));
                res.render(page, {
                    title: page,
                    info: req.session.data,
                    timerID: time_id,
                    messages: req.flash(),
                    link: mods.is_link(req.session.data["text"])
                });
            });
    }
    else
    {
        console.log("No sessions found!");
        res.render(page, {
            title: page,
            info: mods.object_default,
            timerID: "",
            messages: req.flash(),
            link: false
        });
    }
}

async function sync_session(request)
{
    let is_synced = false;
    return Redirect.findOne({ linker: request.session.data["linker"] })
        .then((r) =>
        {
            is_synced = request.session.data["text"] === r.text;

            if (is_synced) return;
            else
            {
                console.log("Out of sync! Syncing...");
                request.session.data = r;
            }
        })
        .catch((err) =>
        {
            console.log("Something ain't right!\n" + err);
        });
}

function foreign_redirect(req, res)
{
    res.status(404).render("404", { title: "404 error" });
}

function on_post(req, res)
{
    let link = req.body.userlink;

    if (req.session.data && link != req.session.data["linker"])
        reset(req);

    Redirect.findOne({ linker: link })
        .then((result) =>
        {
            if (result != null)
            {
                req.session.data = result;
                res.redirect("/inbox");
            }
            else
            {
                const new_user = new Redirect({ linker: link, text: "" });
                new_user.save()
                    .then((s_result) =>
                    {
                        console.log("[ New Output ]\n" + s_result);
                        req.session.data = s_result;
                        res.redirect("/inbox");
                    })
                    .catch((err) =>
                    {
                        console.log("Error: \n" + err);
                        res.redirect("/");
                    });
            }
        })
        .catch((err) =>
        {
            console.log("Error: \n" + err);
            res.redirect("/");
        });

}

function on_inbox_post(req, res)
{
    let text = req.body.textinput;
    let time_to_remove = req.body.removal;

    if (!req.session.data)
    {
        res.redirect("/");
        return;
    }

    let link = req.session.data["linker"];

    Redirect.findOne({ linker: link })
        .then((result) =>   
        {
            if (!result)
            {
                res.redirect("/");
                reset(req);
                return;
            }

            if (result["text"] === text && (prev_t === time_to_remove && prev_t !== undefined)) 
            {
                console.log(prev_t + " " + time_to_remove);
                res.redirect("/inbox");
                return;
            }

            result["text"] = text;
            time_id = req.session.data["linker"] === link ? time_to_remove : "no-opt";

            result.save()
                .then((s_result) =>
                {
                    let duration = mods.parse_time(time_to_remove);

                    req.session.data = s_result;
                    req.session.cookie.maxAge = duration;
                    console.log("[ New Text ]\n" + s_result);

                    clearTimeout(timers[link]);
                    if (duration !== null)
                        timers[link] = setTimeout(remove_data.bind(null, req), duration);

                    prev_t = time_to_remove;

                    req.flash("success", `Your text is now saved for ${mods.parse_timeID(time_id)}!`);
                    res.redirect("/inbox");
                })
                .catch((err) =>
                {
                    console.log("Error: \n" + err);
                    res.redirect("/");
                });

        })
        .catch((err) =>
        {
            console.log("Error \n" + err);
        });

}

function remove_data(req)
{
    if (req.session.data["_id"] == 0)
    {
        console.log("No data to delete.");
        return;
    }

    Redirect.findByIdAndRemove(req.session.data["_id"], (err) =>
    {
        if (err)
        {
            console.log(err);
        }
        else
        {
            console.log("Deleting data of " + req.session.data["linker"]);
        }
    });
}

function reset(request)
{
    let link = request.session.data["linker"];

    request.session.data = mods.object_default;
    if (timers[link]) delete timers[link];

    console.log("Session value " + link + " destroyed!");
    request.flash("success", `Session for ${link} replaced!`)
}
