//const viewProject = require("./assets/js/project");

const express = require("express");
const hbs = require("hbs");
const app = express();
const path = require("node:path");
const multer = require("multer");
const fs = require('fs');
const {Sequelize, QueryTypes} = require("sequelize");
const { blog } = require('./models');

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

async function getUsers() {
  const blogs = await blog.findAll();
  return blogs;
}

async function fetchBlog (req, res) {
  // const query = 'SELECT * FROM blogs';
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});

  console.log("GET USERS");
  console.log( await getUsers());
  const obj = await getUsers();
  res.render("index", {obj});
}

async function getDetailUsers(idParams) {
  const blogs = await blog.findOne({where: {id: idParams}});
  return blogs;
}

async function fetchDetailBlog(idParams, req,res) {
  // const query = `SELECT * FROM blogs WHERE id=${idParams}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  console.log("GET USERS");
  console.log( await getDetailUsers(idParams));
  const obj = await getDetailUsers(idParams);
  console.log(obj);
  res.render("project-page", {obj});
}

async function fetchEditBlog(idParams, req,res) {
  // const query = `SELECT * FROM blogs WHERE id=${idParams}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const obj = await blog.findOne({where: {id: idParams}});
  const iconsName = {}
  if(obj.iconsArray) {
    obj.iconsArray.forEach((val) => {
      switch (val) {
        case "../assets/img/icon/node-js.png":
          return iconsName.node = "node";
        case "../assets/img/icon/atom.png":
          return iconsName.react = "react";
        case "../assets/img/icon/next-js-seeklogo.svg":
          return iconsName.next = "next";
        case "../assets/img/icon/typescript.png":
          return iconsName.ts = "typeScript";
        default:
          return null;
      }
    })
  }
  
  console.log(obj);
  res.render("edit-project", {obj: obj, iconsName: iconsName});
}

async function postBlog (req, res) {
  const { name, start, end, desc, icons } = req.body;
  let filePath;
  if(req.file) filePath = req.file.path;
  const duration = calculateDuration(start, end);
  const iconsPath = iterateIcons(icons);
  //-----
  let iconsArray = ['SELECT', 'ICONS!'];
  iconsArray = iconsArray.map(icon => `'${icon}'`).join(',');
  if(iconsPath)
  {
    iconsArray = [];
    iconsArray = iconsPath.map(icon => `'${icon}'`).join(',');
  }

  // const query = `INSERT INTO blogs(
  //   name, "desc", file, "createdAt", "updatedAt", "iconsArray", start, "end", duration)
  //   VALUES ('${name}', '${desc}', '${filePath}', now(), now(), ARRAY[${iconsArray}], '${start}', '${end}', '${duration}');`;

  // const obj = await sequelize.query(query, {type: QueryTypes.INSERT});

  const obj = await blog.create({
      name: name,
      desc: desc,
      file: filePath,
      createdAt: sequelize.literal('CURRENT_TIMESTAMP'),
      updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
      iconsArray: iconsPath,
      start: start,
      end: end,
      duration: duration

    });

  
}

async function deleteBlog (idParams) {
  const file = `SELECT file FROM blogs WHERE id=${idParams}`
  // const query = `DELETE FROM blogs WHERE id=${idParams}`;
  const fileQuery = await sequelize.query(file, {type: QueryTypes.SELECT});
  // const obj = sequelize.query(query, {type: QueryTypes.DELETE});

  const obj = await blog.destroy({where: {id: idParams}});
  return fileQuery;
}

async function UpdateBlog (idParams,req, res) {
  const { name, start, end, desc, icons } = req.body;
  let filePath;
  if(req.file) filePath = req.file.path;
  const duration = calculateDuration(start, end);
  const iconsPath = iterateIcons(icons);
  let iconsArray = ['SELECT', 'ICONS!'];
  iconsArray = iconsArray.map(icon => `'${icon}'`).join(',');
  if(iconsPath)
  {
    iconsArray = [];
    iconsArray = iconsPath.map(icon => `'${icon}'`).join(',');
  }

  // const query = `UPDATE blogs
	// SET name='${name}', "desc"='${desc}', file='${filePath}', "updatedAt"=now(), "iconsArray"=ARRAY[${iconsArray}], start='${start}', "end"='${end}', duration='${duration}'
	// WHERE id=${idParams};`;

  // const obj = await sequelize.query(query, {type: QueryTypes.UPDATE});

  const obj = await blog.update({
    name: name,
    desc: desc,
    file: filePath,
    updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
    iconsArray: iconsPath,
    start: start,
    end: end,
    duration: duration
    },
    {
      where: {id: idParams}
    }

  );
}


//Render home page
app.get("/index", (req, res) => {
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
  const id = req.params.id;
  fetchDetailBlog(id,req,res);
});

// Open the edit page for selected blog
app.get("/edit-project:id", function (req, res) {
  const { id } = req.params;
  fetchEditBlog(id, req, res);
});

// ----------------------------------------------------------------------

// Redirect after edit blog
app.post("/confirm-edit/:id",  upload.single('file'), async function (req, res) {
  const id = req.params.id;
  
  const file = `SELECT file FROM blogs WHERE id=${id}`
  const fileQuery = await sequelize.query(file, {type: QueryTypes.SELECT});
  console.log(fileQuery);
  fs.unlinkSync(fileQuery[0].file);

  console.log(req.body);
  UpdateBlog(id, req, res);
  res.redirect("/index");
});

// Create new blog
app.post("/new-project", upload.single('file'), function (req, res) {
  console.log("New Post Created!");
  
  // function addPostVariable() {
  //   const { name, start, end, desc, icons } = req.body;

  //   const duration = calculateDuration(start, end);
  //   const iconsArray = iterateIcons(icons);
  //   const length = dataProject.length;
  //   let filePath;
  //   if(req.file) filePath = req.file.path;
  //   dataProject.unshift({
  //     id: length,
  //     name,
  //     start,
  //     end,
  //     duration,
  //     desc,
  //     file: filePath,
  //     iconsArray,
  //   });
  // }
  postBlog(req,res);
  res.redirect("/index");
});

//Edit blog before redirect
app.patch("/patch-project/:id", async function (req, res) {
  const id = req.params.id;
  // delete the prev file
  const file = `SELECT file FROM blogs WHERE id=${id}`
  const fileQuery = await sequelize.query(file, {type: QueryTypes.SELECT});
  console.log(fileQuery);
  try {
    fs.unlinkSync(fileQuery[0].file);
  } catch (err) {
    console.log("DELETE IMAGE ERROR")
  }
  
  // update the database
});

//Delete Blog
app.delete("/new-project/:id", async function (req, res) {
  
  const file = await deleteBlog(req.params.id);
  try {
    fs.unlinkSync(file[0].file);
  } catch (err) {
    console.log("DELETE IMAGE ERROR")
  }
  res.redirect("/index");
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
