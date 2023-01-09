import express from "express"
import morgan from "morgan"
import mongoose from "mongoose"
import session from "express-session"
import flash from "connect-flash"

import { Redirect } from "./models/redirects.js"
import * as mods from "./modules.js"

const app = express();
const dbURI = `mongodb+srv://${mods.keys.user}:${mods.keys.pass}@${mods.keys.user}.wo85kxg.mongodb.net/nodeboard_db?retryWrites=true&w=majority`;

const timers = [];

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
app.get("/inbox", on_inbox_get);

app.post("/", on_post);
app.post("/inbox", on_inbox_post);
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

function on_get(req, res)
{
    if (req.session.data)
    {
        const unused = req.session.data["createdAt"] === req.session.data["updatedAt"] && req.session.data["_id"] !== 0;

        if (!unused)
        {
            return res.render("Home", {
                title: "Home",
                info: req.session.data,
                message: req.flash()
            });
        }

        let d_temp = req.session.data;
        if (d_temp["_id"] === 0) return res.redirect("/");

        req.flash("warning", `${d_temp["linker"]} is not being used! Removing...\n`);
        remove_data(req)
            .then(() =>
            {
                reset(req);
                return res.render("Home", {
                    title: "Home",
                    info: mods.object_default,
                    message: req.flash()
                });
            });
    }
    else
    {
        console.log("No sessions found!");
        return res.render("Home", {
            title: "Home",
            info: mods.object_default,
            message: req.flash()
        });
    }
}

function on_inbox_get(req, res)
{
    if (req.session.data)
    {
        const time_id = req.session.data["time_id"] === "" ? "d-one" : req.session.data["time_id"];
        sync_session(req)
            .then((result) =>
            {
                res.render("TextPage", {
                    title: "TextPage",
                    info: req.session.data,
                    timerID: req.session.data["linker"] === "Prabesh" ? "no-opt" : time_id,
                    messages: req.flash(),
                    has_link: mods.is_link(req.session.data["text"]),
                    link: mods.get_clickable(req.session.data["text"])
                });
            });
        console.log("Database session name: " + req.session.data["linker"]);
    }
    else
    {
        console.log("No sessions found!");
        res.render("TextPage", {
            title: "TextPage",
            info: mods.object_default,
            timerID: "",
            messages: "Nothing found!",
            has_link: false,
            link: ""
        });
    }
}

async function sync_session(request)
{
    const text = request.session.data["text"];
    const time = request.session.data["time_id"];

    return Redirect.findOne({ linker: request.session.data["linker"] })
        .then((r) =>
        {
            if (text === r.text && time === r.time_id) return false;
            else
            {
                console.log("Out of sync! Syncing...");
                request.session.data = r;

                return true;
            }
        })
        .catch((err) =>
        {
            console.log("Something ain't right!\n" + err);
            return false;
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
                const new_user = new Redirect({ linker: link, text: "", time_id: "" });
                new_user.save()
                    .then((s_result) =>
                    {
                        console.log("[ New User ]\n" + s_result);
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

    let current_name = req.session.data["linker"];

    Redirect.findOne({ linker: current_name })
        .then((result) =>   
        {
            if (!result)
            {
                reset(req);
                if (timers[current_name]) delete timers[current_name];
                return res.redirect("/");
            }

            if (result["text"] === text && (prev_t === time_to_remove && prev_t !== undefined)) 
            {
                res.redirect("/inbox");
                return;
            }

            result["text"] = text;
            result["time_id"] = time_to_remove;

            result.save()
                .then((s_result) =>
                {
                    let duration = mods.parse_time(time_to_remove);

                    req.session.data = s_result;
                    req.session.cookie.maxAge = duration;

                    clearTimeout(timers[current_name]);
                    if (duration !== null)
                        timers[current_name] = setTimeout(remove_data.bind(null, req), duration);

                    prev_t = time_to_remove;

                    console.log(`[ Update to data for duration of ${mods.parse_timeID(result["time_id"])}]\n${s_result}`);

                    req.flash("success", `Your text is now saved for ${mods.parse_timeID(result["time_id"])}!`);
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

async function remove_data(req)
{
    if (req.session.data["_id"] === 0)
    {
        console.log("No data to delete.");
        return;
    }

    try
    {
        await Redirect.findByIdAndRemove(req.session.data["_id"]);
        console.log("Deleting data of " + req.session.data["linker"]);
    }
    catch (err)
    {
        console.log(err);
    }
}

function reset(request)
{
    let link = request.session.data["linker"];
    if (link === mods.object_default.linker) return;

    request.session.data = mods.object_default;

    console.log("Session value " + link + " destroyed!");
    request.flash("success", `Session for ${link} replaced!`);
}
