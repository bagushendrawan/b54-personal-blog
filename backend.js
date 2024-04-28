//const viewProject = require("./assets/js/project");

const express = require("express");
const hbs = require("hbs");
const app = express();
const path = require("node:path");
const multer = require("multer");
const fs = require('fs');
const {Sequelize, QueryTypes} = require("sequelize");
const { type } = require("node:os");
const config = require('./config/config.json')
const sequelize = new Sequelize(config.development);

const port = 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "./assets")));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./bootstrap"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/tmp/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

let dataProject = [];

// -------------------------------------------------------------------------

async function fetchBlog (req, res) {
  const query = 'SELECT * FROM blogs';
  const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  console.log(obj);
  const { id, name, start, end, desc, file, iconsArray } = obj[0];
  const duration = calculateDuration(start, end);
  const iconsPath = iterateIcons(iconsArray);
  console.log("Iconspath " + iconsPath);
  console.log("Duration " + duration);
  res.render("index", {obj: obj, duration: duration, iconsPath: iconsPath});
}

//Render home page
app.get("/", (req, res) => {
  fetchBlog(req, res);
});

//Render contact form page
app.get("/contact-form", function (req, res) {
  res.render("contact-form");
});

//Render add project page
app.get("/new-project", function (req, res) {
  res.render("new-project");
});

// Open page details
app.get("/project-page:id", function (req, res) {
  const id = parseInt(req.params.id);
  const dataArr = getItemById(dataProject, id);
  const data = dataArr[0];
  res.render("project-page", { data });
});

// Open the edit page for selected blog
app.get("/edit-project:id", function (req, res) {
  const { id } = req.params;
  const dataArr = getItemById(dataProject, id);
  const data = dataArr[0];
  let iconIdAray = {};

  if (data.iconsArray !== undefined) {
    data.iconsArray.forEach((val) => {
      switch (val) {
        case "../assets/img/icon/node-js.png":
          iconIdAray.node = true;
          break;
        case "../assets/img/icon/atom.png":
          iconIdAray.react = true;
          break;
        case "../assets/img/icon/next-js-seeklogo.svg":
          iconIdAray.next = true;
          break;
        case "../assets/img/icon/typescript.png":
          iconIdAray.ts = true;
          break;
        default:
          console.log("Check the iconsArray");
          break;
      }
    });
  }

  data["iconIdArray"] = iconIdAray;
  res.render("edit-project", { data });
});

// ----------------------------------------------------------------------
// Multer upload file
app.post("/upload-file", upload.single('file'), function (req, res) {
  console.log("HIT");
  console.log(req.file);
  res.sendStatus(200);
  res.send(req.file);
});

// Redirect after edit blog
app.post("/confirm-edit", function (req, res) {
  res.render("index", { dataProject });
});

// Create new blog
app.post("/new-project", upload.single('file'), function (req, res) {
  console.log("New Post Created!");
  
  // console.log(req.file);
  const { name, start, end, desc, icons } = req.body;

  const duration = calculateDuration(start, end);
  const iconsArray = iterateIcons(icons);
  const length = dataProject.length;
  let filePath;
  if(req.file) filePath = req.file.path;
  dataProject.unshift({
    id: length,
    name,
    start,
    end,
    duration,
    desc,
    file: filePath,
    iconsArray,
  });

  // console.log(dataProject);
  // console.log(dataProject[0].file);
  res.redirect("/");
});

//Edit blog before redirect
app.patch("/patch-project", upload.single('file'), function (req, res) {
  const { id, name, start, end, desc, file, iconsArray } = req.body;
  const duration = calculateDuration(start, end);
  const iconsPathArray = iterateIcons(iconsArray);
  let filePath;
  if(req.file) filePath = req.file.path;
  const data = {
    id,
    name,
    start,
    end,
    duration,
    desc,
    file: filePath,
    iconsArray: iconsPathArray,
  };

  dataProject.splice(getindexbyID(dataProject, id), 1, data);
});

//Delete Blog
app.delete("/new-project/:id", function (req, res) {
  const { id } = req.params;

  fs.unlinkSync(dataProject[id].file);
  dataProject = deleteItemById(dataProject, id);
});

app.listen(port);

function calculateDuration(start, end) {
  let timeDifferencesMs = new Date(end) - new Date(start);
  let differencesDay = Math.floor(timeDifferencesMs / (1000 * 60 * 60 * 24));
  let differenceMonth = Math.floor(differencesDay / 30.437);
  let differenceYear = Math.floor(differenceMonth / 12);

  let dateDifferences;
  if (differenceYear > 0) {
    dateDifferences = `${differenceYear} Year ${differenceMonth % 12} Month ${
      differencesDay % 30
    } Day`;
  } else if (differenceMonth > 0) {
    dateDifferences = `${differenceMonth % 12} Month ${
      differencesDay % 30
    } Day`;
  } else {
    dateDifferences = `${differencesDay % 30} Day`;
  }

  return dateDifferences;
}

function iterateIcons(arr) {
  if (arr) {
    let checkboxes = arr.map((check) => {
      console.log(check);
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

function deleteItemById(obj, id) {
  obj = obj.filter((item) => {
    return item.id != id;
  });
  
  return obj;
}

function getItemById(obj, id) {
  obj = obj.filter((item) => {
    return item.id == id;
  });

  return obj;
}

function getindexbyID(obj, id) {
  const index = obj.filter((val, ind) => {
    if (val.id == id) {
      return ind;
    }
  });
  return index;
}
