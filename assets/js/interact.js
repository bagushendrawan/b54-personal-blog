let hamburg = document.getElementById("hamburger-menu");
let bars = document.getElementById("bars-btn");
let xmark = document.getElementById("x-btn");
let contact_nav = document.getElementById("btn-contact-nav");
let testimonialButton = document.getElementById("testimonialIcon");
let testimonialForm = document.getElementById("testi-form");


function updateSize() {
  console.log(window.innerWidth);
    if(window.innerWidth > 720)
    {
        console.log(window.innerWidth);
        hamburg.style.display = "none";
        bars.style.display = "none";
        contact_nav.style.display = "inline-block";
    } else {
        bars.style.display = "inline-block";
        contact_nav.style.display = "none";
        xmark.style.display = "none";
    }
}

function hamburgerMenu() {
    if (hamburg.style.display == "flex") {
      hamburg.style.display = "none";
      bars.style.display = "inline-block";
      xmark.style.display = "none";
    } else {
      hamburg.style.display = "flex";
      bars.style.display = "none";
      xmark.style.display = "inline-block";
    }
  }

function testimonialBtn ()
{
  console.log(testimonialForm)
  if(testimonialForm.style.display == "block")
  {
    testimonialForm.style.display = "none";
    testimonialButton.classList.remove("fa-xmark");
    testimonialButton.classList.add("fa-plus");
    testimonialButton.style.color = "rgb(255, 255, 255)";
    
  } else {
    testimonialForm.style.display = "block";
    testimonialButton.classList.remove("fa-plus");
    testimonialButton.classList.add("fa-xmark");
    testimonialButton.style.color = "rgb(0, 100, 251)";
  }
}

window.addEventListener('resize', updateSize);
updateSize();
