var dataProject = [];

function addProject(event) {
    event.preventDefault();

    let checkArr = [];
    let name = document.getElementById("name").value;
    let startdate = document.getElementById("start").value;
    let enddate = document.getElementById("end").value;
    let desc = document.getElementById("desc").value;
    let check = document.querySelectorAll('input[type=checkbox]:checked');
    let image = document.getElementById("file").value;


    if (name === "") {
        return alert("Please entered your name!")
    } else if (startdate === "") {
        return alert("Please entered your start date!")
    } else if (enddate === "") {
        return alert("Please entered your end date!")
    } else if (desc === "") {
        return alert("Please entered your description!")
    } else if (image === "") {
        return alert("Please entered your image!")
    }

    for (var i = 0; i < check.length; i++) {
        checkArr.push(check[i].value)
      }

    dataProject.push({
        name: name,
        start: startdate,
        end: enddate,
        desc: desc,
        checkbox: checkArr,
        img: image
    })

    console.log(checkArr);
    console.log(dataProject);
}