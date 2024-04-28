

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

  let icons = []
  var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

  for (var i = 0; i < checkboxes.length; i++) {
    icons.push(checkboxes[i].value)
  }


  const obj = {
    id: id,
    name: name,
    start: start,
    end: end,
    desc: desc,
    iconsArray: icons
  }

 const response = fetch(`/patch-project`,
		{
			method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj),
      cache: "no-cache",
      redirect: "follow"
    });


}