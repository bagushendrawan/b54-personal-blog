let hamburg = document.getElementById("hamburger-menu");
let bars = document.getElementById("bars-btn");
let xmark = document.getElementById("x-btn");
let contact_nav = document.getElementById("btn-contact-nav");


function updateSize() {
  console.log(window.innerWidth);
    if(window.innerWidth > 640)
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

window.addEventListener('resize', updateSize);
updateSize();
