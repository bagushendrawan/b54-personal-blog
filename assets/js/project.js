//var dataProject = [];

// function addProject(event) {
//   event.preventDefault();

//   let checkArr = [];
//   let name = document.getElementById("name").value;
//   let startdate = document.getElementById("start").value;
//   let enddate = document.getElementById("end").value;
//   let desc = document.getElementById("desc").value;
//   let check = document.querySelectorAll("input[type=checkbox]:checked");
//   let image = document.getElementById("file").files[0];
//   let imageURL = URL.createObjectURL(image);

//   if (name === "") {
//     return alert("Please entered your name!");
//   } else if (startdate === "") {
//     return alert("Please entered your start date!");
//   } else if (enddate === "") {
//     return alert("Please entered your end date!");
//   } else if (desc === "") {
//     return alert("Please entered your description!");
//   } else if (image === "") {
//     return alert("Please entered your image!");
//   }

//   if(startdate > enddate)
//   {
//     return alert("Start date cannot started earlier than end date");
//   }

//   let timeDifferencesMs = new Date(enddate) - new Date(startdate);
//   let differencesDay = Math.floor(timeDifferencesMs / (1000 * 60 * 60 * 24));
//   let differenceMonth = Math.floor(differencesDay / 30.437);
//   let differenceYear = Math.floor(differenceMonth / 12);

//   let dateDifferences;
//   if (differenceYear > 0) {
//     dateDifferences = `${differenceYear} Year ${differenceMonth%12} Month ${differencesDay%30} Day`;
//   } else if (differenceMonth > 0) {
//     dateDifferences = `${differenceMonth%12} Month ${differencesDay%30} Day`;
//   } else {
//     dateDifferences = `${differencesDay%30} Day`;
//   }

//   for (var i = 0; i < check.length; i++) {
//     checkArr.push(check[i].value);
//   }

//   dataProject.unshift({
//     name: name,
//     start: startdate,
//     end: enddate,
//     desc: desc,
//     checkbox: checkArr,
//     img: imageURL,
//     duration: dateDifferences,
//   });

//   //console.log(enddate - startdate);
//   //console.log(timeDifferencesMs);
//   console.log(imageURL);
//   console.log(dataProject);

//   viewProject();
// }

// function viewProject(dataPro) {
//   let html = "";
//   dataPro.forEach((data) => {
    
//     let checkboxes = "";
//     data.checkbox.forEach((check) => {
//       switch (check) {
//         case "node":
//           checkboxes += `<img src="../assets/img/icon/node-js.png" style="height:1.5rem" />`;
//           break;
//         case "react":
//           checkboxes += `<img src="../assets/img/icon/atom.png" style="height:1.5rem" />`;
//           break;
//         case "next":
//           checkboxes += `<img src="../assets/img/icon/next-js-seeklogo.svg" style="height:1.5rem" />`;
//           break;
//         case "typeScript":
//           checkboxes += `<img src="../assets/img/icon/typescript.png" style="height:1.5rem" />`;
//           break;
//       }
//     });

//     html += `
//     <a href="./project-page.html" class="text-none text-dark">
//           <div class="card p-2" style="width: 18rem;">
//             <img src="${data.img}" class="card-img-top" alt="..." style="height: 200px; object-fit: cover;">
//             <div class="card-body">
//               <h5 class="card-title">${data.name}</h5>
//               <p class="card-text" id="duration">${data.duration}</p>
//               <p class="card-text"  id="syn">${data.desc}</p>
//               <div class="icons mb-4">${checkboxes}</div>

//               <div class="row g-2 mx-a d-flex justify-content-center">
//                 <button href="#" class="col-5 btn btn-primary me-4 border-0 black">Edit</button>
//                 <button href="#" class="col-5 btn btn-primary border-0 black">Delete</button>
//               </div>
              
//               </div>
//           </div>
//     </a>`;


//   });

//   document.getElementById("gallery").innerHTML = html;
// }

async function deleteProject(id)
{
  const response = await fetch(
		`/new-project/${id}`,
		{
			method: 'DELETE',
    });
}

async function editProject(id)
{
  const name = document.getElementById("name").value;
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const desc = document.getElementById("desc").value;
  const node = document.querySelector('input[id="node"]:checked').value;
  const next = document.querySelector('input[id="next"]:checked').value;
  const react = document.querySelector('input[id="react"]:checked').value;
  const ts = document.querySelector('input[id="ts"]:checked').value;
  let icons = []

  if(node)
  {
    icons.push(node);
  }
  if(next)
  {
    icons.push(next);
  }
  if(react)
  {
    icons.push(react);
  }
  if(ts)
  {
    icons.push(ts);
  }

  const obj = {
    name: name,
    start: start,
    end: end,
    desc: desc,
    iconsArray: icons
  }

  // console.log("here");
  // console.log(obj);

  await fetch(`/edit-project/${id}`,
		{
			method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    });

}