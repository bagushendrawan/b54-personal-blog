//const viewProject = require("./assets/js/project");

const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('node:path');

const port = 5000;

app.use(express.urlencoded({extended: false}));
app.use("/assets", express.static(path.join(__dirname, "./assets")));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, "./bootstrap"));

let dataProject = [];

app.get('/', function (req, res) {
    res.render("index");
  });

app.get('/contact-form', function (req, res) {
    res.render("contact-form");
  });

app.get('/new-project', function (req, res) {
    res.render("new-project", {dataProject});
  });

app.get('/project-page/:id', function (req, res) {
  const id = parseInt(req.params.id);
  const data = dataProject[id];
    res.render("project-page", {data});
  });

app.post('/new-project', function (req, res) {
    const {name, start, end, desc, file, icons } = req.body;

    const duration = calculateDuration(start, end);
    const iconsArray = iterateIcons(icons);
    const length = dataProject.length;
    //console.log("length" + length);
    dataProject.unshift({
        id: length,
        name,
        start,
        end,
        duration,
        desc,
        file,
        iconsArray
    })
    console.log("Data has been added!");
    console.log(dataProject);
    res.redirect("new-project");
  });
  
app.listen(port);

function calculateDuration(start, end) {
    let timeDifferencesMs = new Date(end) - new Date(start);
    let differencesDay = Math.floor(timeDifferencesMs / (1000 * 60 * 60 * 24));
    let differenceMonth = Math.floor(differencesDay / 30.437);
    let differenceYear = Math.floor(differenceMonth / 12);
  
    let dateDifferences;
    if (differenceYear > 0) {
      dateDifferences = `${differenceYear} Year ${differenceMonth%12} Month ${differencesDay%30} Day`;
    } else if (differenceMonth > 0) {
      dateDifferences = `${differenceMonth%12} Month ${differencesDay%30} Day`;
    } else {
      dateDifferences = `${differencesDay%30} Day`;
    }

    return dateDifferences;
}

function iterateIcons(arr)
{
    if (arr) {
        let checkboxes = arr.map((check) => {
            switch (check) {
                case "node":
                    return "../assets/img/icon/node-js.png";
                case "react":
                    return "../assets/img/icon/atom.png";
                case "next":
                    return "../assets/img/icon/next-js-seeklogo.svg";
                case "typeScript":
                    return "../assets/img/icon/typescript.png";
                default:
                    return null;
            }
        });

        return checkboxes;
    }
}