//const viewProject = require("./assets/js/project");
require('dotenv').config();
const express = require("express");
const hbs = require("hbs");
const app = express();
const path = require("node:path");
const multer = require("multer");
const fs = require('fs');
const {Sequelize, QueryTypes} = require("sequelize");
const { blog, user } = require('./models');
blog.belongsTo(user, { foreignKey: 'authorID' });

const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

const config = require('./config/config.json')
const sequelize = new Sequelize(config.development);

const port = 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use(session({
  name: "Our Sessions",
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 60000
   }
}))
app.use(flash());


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


// -------------------------------------------------------------------------

async function getUsers() {
  const blogs = await blog.findAll();
  return blogs;
}

async function fetchBlog (req, res) {
  const userLog = await getUserLog(req,res);
  let obj = [];
  if(req.session.isLogin)
  {
    // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE "authorID" = ${req.session.user.authorID};`;
    // obj = await sequelize.query(query, {type: QueryTypes.SELECT});

    obj = await blog.findAll({include: [{
      model: user,
      attributes: [['name', 'username']],
      required: true, //true untuk inner join
      where: {id: req.session.user.authorID}
    }]}) 

    console.log("join ", obj);
    console.log("USER ", obj[0].user.dataValues.username);
    //obj = await getUsers();
    res.render("new-project", {obj, userLog, isLogin:req.session.isLogin});
  } else {
    req.flash("fail", "Please Login to see our blogs");
    res.render("new-project", {obj, userLog, isLogin:false});
  }
}

async function getDetailUsers(idParams, req, res) {
  // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE blogs.id = ${idParams};`;
  // const blogs = await sequelize.query(query, {type: QueryTypes.SELECT});
  //const blogs = await blog.findOne({where: {id: idParams}});
  const blogs = await blog.findOne({include: [{
    model: user,
    attributes: [['name', 'username']],
    required: true, //true untuk inner join
  }],
  where: {id: idParams}
}) 

  console.log("BLOGS ", blogs);
  return blogs;
}

async function fetchDetailBlog(idParams, req,res) {
  // const query = `SELECT * FROM blogs WHERE id=${idParams}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const userLog = await getUserLog(req,res);
  const obj = await getDetailUsers(idParams, req, res);
  console.log(obj);
  res.render("project-page", {obj, userLog, isLogin:req.session.isLogin});
}

async function fetchEditBlog(idParams, req,res) {
  // const query = `SELECT * FROM blogs WHERE id=${idParams}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const userLog = await getUserLog(req,res);
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
  res.render("edit-project", {obj: obj, iconsName: iconsName, userLog, isLogin:req.session.isLogin});
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
      duration: duration,
      authorID: req.session.user.authorID

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
app.get("/", (req, res) => {
  res.redirect("/index");
});

app.get("/index", async (req, res) => {
  let obj = [];
  if(req.session.isLogin)
  {
  // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE "authorID" = ${req.session.user.authorID};`;
  // obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  obj = await blog.findAll({include: [{
    model: user,
    attributes: [['name', 'username']],
    required: true, //true untuk inner join
    where: {id: req.session.user.authorID}
  }]});
  }
  const userLog = await getUserLog(req,res);
  
  res.render("index", {obj, userLog, isLogin:req.session.isLogin});
});

//Render contact form page
app.get("/contact-form", async function (req, res) {
  const userLog = await getUserLog(req,res);
  res.render("contact-form", {userLog, isLogin:req.session.isLogin});
});

//Render project page
app.get("/new-project", async function (req, res) {
  fetchBlog(req, res);
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

app.get("/register", async function(req,res){
  const userLog = await getUserLog(req,res);
  res.render("register", {userLog, isLogin:req.session.isLogin});
})

app.get("/login", async function(req,res){
  const userLog = await getUserLog(req,res);
  res.render("login", {userLog, isLogin:req.session.isLogin});
})

// ----------------------------------------------------------------------
app.post("/register", upload.single('file'), function(req,res){
  const {username, email, password} = req.body;
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async function(err, hash) {
    // Store hash in your password DB.
    try {
        // const query = `INSERT INTO blogs(
        //   name, email, password, file, "createdAt", "updatedAt")
        //   VALUES ('${username}','${email}', '${filePath}', '${password}', now(), now());`;

        // const obj = await sequelize.query(query, {type: QueryTypes.INSERT});
        let filePath;
        if(req.file) filePath = req.file.path;

        console.log("Pass ", hash);
        const obj = await user.create({
        name: username,
        email: email,
        password: hash,
        file: filePath,
        createdAt: sequelize.literal('CURRENT_TIMESTAMP'),
        updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
      });
      req.flash("success", `Successfully registering ${username} account!`);
      res.redirect("/login");
    } catch (err) {
      console.log("Error at Register", err);
      req.flash("fail", `Email already been registered`);
      res.redirect("/register");
    }

  });
  console.log(username, email, password);
})

app.post("/login", async function(req,res){
  const {email, password} = req.body;
  console.log( email, password);

  //... fetch user from a db etc.
  // const query = `SELECT * FROM blogs WHERE email=${email}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const userData = await user.findOne({where: {email: email}});
  
  if(userData){
      const isLogin = await bcrypt.compare(password, userData.password);
      if(isLogin) {
        //login
        req.flash("success", `Successfully log in to ${userData.name} account!`);
        req.session.isLogin = isLogin;
        req.session.user = {
          authorID: userData.id,
          name: userData.name,
          email: userData.email
        }
        res.redirect("/index");
    } else {
      req.flash("fail", `Email/passwords may be incorrect or does not exist`);
      res.redirect("/login");
    }
  } else {
    req.flash("fail", `Email/passwords may be incorrect or does not exist`);
    res.redirect("/login");
  }
  

  //...
});

app.post("/log-out", async (req,res) => {
  req.session.destroy(function(err) {
    console.log("Account has been Logged out");
    res.redirect("/index");
  })
})

// Redirect after edit blog
app.post("/confirm-edit/:id",  upload.single('file'), async function (req, res) {
 if(req.session.isLogin) {const id = req.params.id;
  
  const file = `SELECT file FROM blogs WHERE id=${id}`
  const fileQuery = await sequelize.query(file, {type: QueryTypes.SELECT});
  console.log(fileQuery);
  fs.unlinkSync(fileQuery[0].file);

  console.log(req.body);
  UpdateBlog(id, req, res);
  req.flash("success", `Successfully edit the project!`);
  res.redirect("/new-project");} else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO EDIT PROJECT");
  }
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
  if(req.session.isLogin)
  {
    postBlog(req,res);
    res.redirect("/new-project");
  } else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO POST NEW PROJECT");
  }
  
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
  if(req.session.isLogin)
  {
    const file = await deleteBlog(req.params.id);
  try {
    fs.unlinkSync(file[0].file);
  } catch (err) {
    console.log("DELETE IMAGE ERROR")
  }
  req.flash("fail", `Email/passwords may be incorrect or does not exist`);
  res.redirect("/index");
  } else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO DELETE PROJECT");
  }
});

app.listen(port);

async function getUserLog(req,res){
  let userLog = {};
  if(req.session.isLogin)
  {
    userLog = await user.findOne({where: {email: req.session.user.email}});
    console.log("Get the user login data", userLog);
  } else {
    userLog = null;
  }

  return userLog;
}

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
