var dataProject = [];

function addProject(event) {
  event.preventDefault();

  let checkArr = [];
  let name = document.getElementById("name").value;
  let startdate = document.getElementById("start").value;
  let enddate = document.getElementById("end").value;
  let desc = document.getElementById("desc").value;
  let check = document.querySelectorAll("input[type=checkbox]:checked");
  let image = document.getElementById("file").files[0];
  let imageURL = URL.createObjectURL(image);

  if (name === "") {
    return alert("Please entered your name!");
  } else if (startdate === "") {
    return alert("Please entered your start date!");
  } else if (enddate === "") {
    return alert("Please entered your end date!");
  } else if (desc === "") {
    return alert("Please entered your description!");
  } else if (image === "") {
    return alert("Please entered your image!");
  }

  let timeDifferencesMs = new Date(enddate) - new Date(startdate);
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

  for (var i = 0; i < check.length; i++) {
    checkArr.push(check[i].value);
  }

  dataProject.push({
    name: name,
    start: startdate,
    end: enddate,
    desc: desc,
    checkbox: checkArr,
    img: imageURL,
    duration: dateDifferences,
  });

  //console.log(enddate - startdate);
  //console.log(timeDifferencesMs);
  console.log(imageURL);
  console.log(dataProject);

  viewProject();
}

function viewProject() {
  let html = "";
  dataProject.forEach((data) => {
    let checkboxes = "";
    data.checkbox.forEach((check) => {
      switch (check) {
        case "node":
          checkboxes += `<img class="logo" src="./assets/img/icon/node-js.png" />`;
          break;
        case "react":
          checkboxes += `<img class="logo" src="./assets/img/icon/atom.png" />`;
          break;
        case "next":
          checkboxes += `<img class="logo" src="./assets/img/icon/next-js-seeklogo.svg" />`;
          break;
        case "typeScript":
          checkboxes += `<img class="logo" src="./assets/img/icon/typescript.png" />`;
          break;
      }
    });

    html += `
    <a href="./project-page.html">
        <div class="card">
            <img src="${data.img}" />
            <div>
                <h3>${data.name}</h3>
                <p id="duration">${data.duration}</p>
                <p id="syn">${data.desc}</p>
                <div class="icons">${checkboxes}</div>
                <div>
                    <button type="button">Edit</button>
                    <button type="button">Delete</button>
                </div>
            </div>
        </div>
    </a>`;
  });

  document.getElementById("gallery").innerHTML = html;
}
