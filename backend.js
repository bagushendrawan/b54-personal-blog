//const viewProject = require("./assets/js/project");
require("dotenv").config();
const express = require("express");

let userSubject;
const hbs = require("hbs");
hbs.registerHelper("isAdmin", function () {
  if (userSubject === "Administrator") {
    return true;
  } else {
    return false;
  }
});

const app = express();
const path = require("node:path");
const multer = require("multer");
const fs = require("fs");
const { Sequelize, QueryTypes } = require("sequelize");
const { blog, user } = require("./models");
blog.belongsTo(user, { foreignKey: "authorID" });

const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);

const port = 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use(
  session({
    name: "Our Sessions",
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60000,
    },
  })
);
app.use(flash());

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./bootstrap"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/tmp/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// -------------------------------------------------------------------------

async function getUsers() {
  const blogs = await blog.findAll();
  return blogs;
}

async function fetchBlog(req, res) {
  let obj = [];
  let canEdit;
  if (req.session.isLogin) {
    // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE "authorID" = ${req.session.user.authorID};`;
    // obj = await sequelize.query(query, {type: QueryTypes.SELECT});
    const userSubject = req.session.user.subject;
    const userLog = await getUserLog(req, res);
    //console.log("USERLOG 1", userLog)
    const users = await user.findAll({where: {subject: "Author"}});
    switch (userSubject) {
      case "Guest":
        canEdit = false;
        obj = await blog.findAll({
          include: [
            {
              model: user,
              attributes: [["name", "username"]],
              required: true, //true untuk inner join
            },
          ],
        });
        res.render("new-project", {
          users,
          obj,
          userLog,
          isLogin: req.session.isLogin,
          subject: userSubject,
          canEdit,
        });
        break;
      case "Author":
        canEdit = true;
        obj = await blog.findAll({
          include: [
            {
              model: user,
              attributes: [["name", "username"]],
              required: true, //true untuk inner join
              where: { id: req.session.user.authorID },
            },
          ],
        });
        res.render("new-project", {
          obj,
          userLog,
          isLogin: req.session.isLogin,
          subject: userSubject,
          canEdit,
        });
        break;
      case "Administrator":
        canEdit = true;
        obj = await blog.findAll({
          include: [
            {
              model: user,
              attributes: [["name", "username"]],
              required: true, //true untuk inner join
            },
          ],
        });
        res.render("new-project", {
          obj,
          userLog,
          isLogin: req.session.isLogin,
          subject: userSubject,
          canEdit,
        });
        break;
    }

    //obj = await getUsers();
  } else {
    canEdit = false;
    obj = await blog.findAll({
      include: [
        {
          model: user,
          attributes: [["name", "username"]],
          required: true, //true untuk inner join
        },
      ],
    });
    const userLog = await getUserLog(req, res);
    req.flash("fail", "Login to see our page");
    res.render("new-project", {
      obj,
      userLog,
      isLogin: req.session.isLogin,
      canEdit,
    });
  }
}

async function fetchFilteredBlog(idParams, req, res) {
  let obj = [];
  let canEdit;
  if (req.session.isLogin) {
    // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE "authorID" = ${req.session.user.authorID};`;
    // obj = await sequelize.query(query, {type: QueryTypes.SELECT});
    const userSubject = req.session.user.subject;
    const userLog = await getUserLog(req, res);
    const users = await user.findAll({where: {subject: "Author"}});

    console.log("USER", users);
    switch (userSubject) {
      case "Guest":
        canEdit = false;
        if (idParams === "x") {
          obj = await blog.findAll({
            include: [
              {
                model: user,
                attributes: [["name", "username"]],
                required: true, //true untuk inner join
              },
            ],
          });
          req.flash("success", "Show all users blog");
          res.render("new-project", {
            users,
            obj,
            userLog,
            isLogin: req.session.isLogin,
            canEdit,
          });
        } else {
          obj = await blog.findAll({
            include: [
              {
                model: user,
                attributes: [["name", "username"]],
                required: true, //true untuk inner join
                where: { id: idParams,
                 },
              },
            ],
          });
          req.flash("success", `Show user ${obj[0].user.dataValues.username} blog`);
          res.render("new-project", {
            users,
            obj,
            userLog,
            isLogin: req.session.isLogin,
            canEdit,
          });
        }
        break;
    }
  } else {
    res.redirect("/new-project");
  }
}

async function getDetailUsers(idParams, req, res) {
  // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE blogs.id = ${idParams};`;
  // const blogs = await sequelize.query(query, {type: QueryTypes.SELECT});
  // const blogs = await blog.findOne({where: {id: idParams}});
  const blogs = await blog.findOne({
    include: [
      {
        model: user,
        attributes: [["name", "username"]],
        required: true, //true untuk inner join
      },
    ],
    where: { id: idParams },
  });
  return blogs;
}

async function fetchDetailBlog(idParams, req, res) {
  // const query = `SELECT * FROM blogs WHERE id=${idParams}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const userLog = await getUserLog(req, res);
  const obj = await getDetailUsers(idParams, req, res);
  res.render("project-page", { obj, userLog, isLogin: req.session.isLogin });
}

async function fetchEditBlog(idParams, req, res) {
  // const query = `SELECT * FROM blogs WHERE id=${idParams}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const userLog = await getUserLog(req, res);
  const obj = await blog.findOne({ where: { id: idParams } });
  const iconsName = {};
  if (obj.iconsArray) {
    obj.iconsArray.forEach((val) => {
      switch (val) {
        case "../assets/img/icon/node-js.png":
          return (iconsName.node = "node");
        case "../assets/img/icon/atom.png":
          return (iconsName.react = "react");
        case "../assets/img/icon/next-js-seeklogo.svg":
          return (iconsName.next = "next");
        case "../assets/img/icon/typescript.png":
          return (iconsName.ts = "typeScript");
        default:
          return null;
      }
    });
  }

  res.render("edit-project", {
    obj: obj,
    iconsName: iconsName,
    userLog,
    isLogin: req.session.isLogin,
  });
}

async function postBlog(req, res) {
  const { name, start, end, desc, icons } = req.body;
  let filePath;
  if (req.file) filePath = req.file.path;
  const duration = calculateDuration(start, end);
  if(duration === "fail"){
    req.flash("fail", "Start date cannot be later than end date");
    return res.redirect("/new-project");
  }
  const iconsPath = iterateIcons(icons);
  //-----
  let iconsArray = ["SELECT", "ICONS!"];
  iconsArray = iconsArray.map((icon) => `'${icon}'`).join(",");
  if (iconsPath) {
    iconsArray = [];
    iconsArray = iconsPath.map((icon) => `'${icon}'`).join(",");
  }

  // const query = `INSERT INTO blogs(
  //   name, "desc", file, "createdAt", "updatedAt", "iconsArray", start, "end", duration)
  //   VALUES ('${name}', '${desc}', '${filePath}', now(), now(), ARRAY[${iconsArray}], '${start}', '${end}', '${duration}');`;

  // const obj = await sequelize.query(query, {type: QueryTypes.INSERT});

  const obj = await blog.create({
    name: name,
    desc: desc,
    file: filePath,
    createdAt: sequelize.literal("CURRENT_TIMESTAMP"),
    updatedAt: sequelize.literal("CURRENT_TIMESTAMP"),
    iconsArray: iconsPath,
    start: start,
    end: end,
    duration: duration,
    authorID: req.session.user.authorID,
  });

  req.flash("success", `Successfully create new project!`);
  res.redirect("/new-project");
}

async function deleteBlog(idParams) {
  const file = `SELECT file FROM blogs WHERE id=${idParams}`;
  // const query = `DELETE FROM blogs WHERE id=${idParams}`;
  const fileQuery = await sequelize.query(file, { type: QueryTypes.SELECT });
  // const obj = sequelize.query(query, {type: QueryTypes.DELETE});

  const obj = await blog.destroy({ where: { id: idParams } });
  return fileQuery;
}

async function deleteUser(idParams) {
  const file = `SELECT file FROM users WHERE id=${idParams}`;
  // const query = `DELETE FROM users WHERE id=${idParams}`;
  const fileQuery = await sequelize.query(file, { type: QueryTypes.SELECT });
  // const obj = sequelize.query(query, {type: QueryTypes.DELETE});

  const obj = await user.destroy({ where: { id: idParams } });
  return fileQuery;
}

async function UpdateBlog(idParams, req, res) {
  const { name, start, end, desc, icons } = req.body;
  let filePath;
  if (req.file) filePath = req.file.path;
  const duration = calculateDuration(start, end);
  if(duration === "fail"){
    req.flash("fail", "Start date cannot be later than end date");
   return res.redirect("/new-project");
  } 
  const iconsPath = iterateIcons(icons);
  let iconsArray = ["SELECT", "ICONS!"];
  iconsArray = iconsArray.map((icon) => `'${icon}'`).join(",");
  if (iconsPath) {
    iconsArray = [];
    iconsArray = iconsPath.map((icon) => `'${icon}'`).join(",");
  }

  // const query = `UPDATE blogs
  // SET name='${name}', "desc"='${desc}', file='${filePath}', "updatedAt"=now(), "iconsArray"=ARRAY[${iconsArray}], start='${start}', "end"='${end}', duration='${duration}'
  // WHERE id=${idParams};`;

  // const obj = await sequelize.query(query, {type: QueryTypes.UPDATE});

  const obj = await blog.update(
    {
      name: name,
      desc: desc,
      file: filePath,
      updatedAt: sequelize.literal("CURRENT_TIMESTAMP"),
      iconsArray: iconsPath,
      start: start,
      end: end,
      duration: duration,
    },
    {
      where: { id: idParams },
    }
  );

  req.flash("success", `Successfully edit the project!`);
  res.redirect("/new-project");
}

async function getUserLog(req, res) {
  let userLog = {};
  if (req.session.isLogin) {
    userLog = await user.findOne({ where: { email: req.session.user.email } });
    //console.log("Get the user login data", userLog);
  } else {
    userLog = null;
  }

  return userLog;
}

//Render home page
app.get("/", (req, res) => {
  res.redirect("/index");
});

app.get("/index", async (req, res) => {
  if (req.session.isLogin) {
    // const query = `SELECT blogs.id, blogs.name, blogs.desc, blogs.file, blogs."createdAt", blogs."updatedAt", blogs."iconsArray", blogs.start, blogs."end", blogs.duration, users.name as username FROM blogs INNER JOIN users ON "authorID" = users.id WHERE "authorID" = ${req.session.user.authorID};`;
    // authorData = await sequelize.query(query, {type: QueryTypes.SELECT});
    const userSubject = req.session.user.subject;
    const userLog = await getUserLog(req, res);

    switch (userSubject) {
      case "Guest":
        obj = await blog.findAll({
          include: [
            {
              model: user,
              attributes: [["name", "username"]],
              required: true, //true untuk inner join
            },
          ],
        });
        res.render("index", {
          obj,
          userLog,
          isLogin: req.session.isLogin,
          subject: userSubject,
        });
        break;
      case "Author":
        obj = await blog.findAll({
          include: [
            {
              model: user,
              attributes: [["name", "username"]],
              required: true, //true untuk inner join
              where: { id: req.session.user.authorID },
            },
          ],
        });
        res.render("index", {
          obj,
          userLog,
          isLogin: req.session.isLogin,
          subject: userSubject,
        });
        break;
      case "Administrator":
        obj = await blog.findAll({
          include: [
            {
              model: user,
              attributes: [["name", "username"]],
              required: true, //true untuk inner join
            },
          ],
        });
        res.render("index", {
          obj,
          userLog,
          isLogin: req.session.isLogin,
          subject: userSubject,
        });
        break;
    }
  } else {
    const userLog = await getUserLog(req, res);
    obj = await blog.findAll({
      include: [
        {
          model: user,
          attributes: [["name", "username"]],
          required: true, //true untuk inner join
        },
      ],
    });
    req.flash("success", "Please login to see our projects");
    res.render("index", { obj, userLog, isLogin: req.session.isLogin });
  }
});

//Render contact form page
app.get("/contact-form", async function (req, res) {
  const userLog = await getUserLog(req, res);
  res.render("contact-form", { userLog, isLogin: req.session.isLogin });
});

//Render project page
app.get("/new-project", async function (req, res) {
  fetchBlog(req, res);
});

//Render filter project button
app.get("/new-project:id", async function (req, res) {
  const id = req.params.id;
  fetchFilteredBlog(id,req, res);
});

// Open page details
app.get("/project-page:id", function (req, res) {
  const id = req.params.id;
  fetchDetailBlog(id, req, res);
});

// Open the edit page for selected blog
app.get("/edit-project:id", function (req, res) {
  const { id } = req.params;
  fetchEditBlog(id, req, res);
});

app.get("/register", async function (req, res) {
  const userLog = await getUserLog(req, res);
  res.render("register", { userLog, isLogin: req.session.isLogin });
});

app.get("/login", async function (req, res) {
  const userLog = await getUserLog(req, res);
  res.render("login", { userLog, isLogin: req.session.isLogin });
});

//Fetch author list
app.get("/author", async (req, res) => {
  if (req.session.isLogin && req.session.user.subject === "Administrator") {
    const userLog = await getUserLog(req, res);
    const users = await user.findAll();
    res.render("author", { userLog, isLogin: req.session.isLogin, users });
  } else {
    req.flash("fail", "You're not an administrator");
    res.redirect("/index");
  }
});

// ----------------------------------------------------------------------
app.post("/register", upload.single("file"), function (req, res) {
  const { username, email, password, subject } = req.body;
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async function (err, hash) {
    try {
      // const query = `INSERT INTO blogs(
      //   name, email, password, file, "createdAt", "updatedAt")
      //   VALUES ('${username}','${email}', '${filePath}', '${password}', now(), now());`;

      // const obj = await sequelize.query(query, {type: QueryTypes.INSERT});
      let filePath;
      if (req.file) filePath = req.file.path;

      const obj = await user.create({
        name: username,
        email: email,
        password: hash,
        file: filePath,
        createdAt: sequelize.literal("CURRENT_TIMESTAMP"),
        updatedAt: sequelize.literal("CURRENT_TIMESTAMP"),
        subject: subject,
      });
      req.flash("success", `Successfully registering ${username} account!`);
      res.redirect("/login");
    } catch (err) {
      console.log("Error at Register", err);
      req.flash("fail", `Email already been registered`);
      res.redirect("/register");
    }
  });
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  //... fetch user from a db etc.
  // const query = `SELECT * FROM blogs WHERE email=${email}`;
  // const obj = await sequelize.query(query, {type: QueryTypes.SELECT});
  const userData = await user.findOne({ where: { email: email } });
  userSubject = userData.subject;
  if (userData) {
    const isLogin = await bcrypt.compare(password, userData.password);
    if (isLogin) {
      //login
      req.flash("success", `Successfully log in to ${userData.name} account!`);
      req.session.isLogin = isLogin;
      req.session.user = {
        authorID: userData.id,
        subject: userData.subject,
        name: userData.name,
        email: userData.email,
      };
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

app.post("/log-out", async (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/index");
  });
});

// Redirect after edit blog
app.post("/confirm-edit/:id", upload.single("file"), async function (req, res) {
  if (req.session.isLogin) {
    const id = req.params.id;

    const file = `SELECT file FROM blogs WHERE id=${id}`;
    const fileQuery = await sequelize.query(file, { type: QueryTypes.SELECT });
    fs.unlinkSync(fileQuery[0].file);

    UpdateBlog(id, req, res);

  } else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO EDIT PROJECT");
  }
});

// Create new blog
app.post("/new-project", upload.single("file"), function (req, res) {
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
  if (req.session.isLogin) {
    postBlog(req, res);
  } else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO POST NEW PROJECT");
  }
});

//Edit blog before redirect
app.patch("/patch-project/:id", async function (req, res) {
  const id = req.params.id;
  // delete the prev file
  const file = `SELECT file FROM blogs WHERE id=${id}`;
  const fileQuery = await sequelize.query(file, { type: QueryTypes.SELECT });
  try {
    fs.unlinkSync(fileQuery[0].file);
  } catch (err) {
    console.log("DELETE IMAGE ERROR");
  }

  // update the database
});

//Delete Blog
app.post("/new-project/:id", async function (req, res) {
  if (req.session.isLogin) {
    const file = await deleteBlog(req.params.id);
    try {
      fs.unlinkSync(file[0].file);
    } catch (err) {
      console.log("DELETE IMAGE ERROR");
    }
    req.flash("success", `Blogs deleted successfully`);
    res.redirect("/new-project");
  } else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO DELETE PROJECT");
  }
});

//Delete User
app.post("/author/:id", async function (req, res) {
  if (req.session.isLogin && req.session.user.subject === "Administrator") {
    const file = await deleteUser(req.params.id);
    try {
      fs.unlinkSync(file[0].file);
    } catch (err) {
      console.log("DELETE IMAGE ERROR");
    }
    req.flash("success", `Users deleted successfully`);
    res.redirect("/author");
  } else {
    res.status(401).send("YOU'RE NOT AUTHORIZED TO DELETE USERS");
  }
});

app.listen(port);



function calculateDuration(start, end) {
  let timeDifferencesMs = new Date(end) - new Date(start);
  if(timeDifferencesMs < 0)
    {
      return "fail";
    }
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
