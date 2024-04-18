let testimonialsOrigin = [];
let testimonials = [];

class Testimonials {
    constructor(img, desc, name, rating)
    {
        this.img = img;
        this.desc = desc;
        this.name = name;
        this.rating = rating;
    }
}

class CompanyTestimonials extends Testimonials {
    constructor(img, desc, name, rating)
    {
        super(img, desc, name + " Company", rating);
    }
}

const classes = {
    Testimonials,
    CompanyTestimonials
}

class DynamicClass {
    constructor (className, img, desc, name, rating) {
        return new classes[className](img, desc, name, rating);
    }
}

function filterBtn(id)
{
    let button = document.getElementById(id).value;
    console.log(button);
    
    if(button != 0)
    {
        testimonials = testimonialsOrigin.filter((item) => {
            return item.rating == button;
        })
    } else {
        testimonials = testimonialsOrigin;
    }
    
    addTestimonials(testimonials);

    console.log(testimonials);
}

function testimonialsAddButton (event) {
    event.preventDefault();
    let name = document.getElementById("name").value;
    let testimony = document.getElementById("testimony").value;
    let senderBtn;
    let rating;
    let checked = false;
    let image = document.getElementById("file").files[0];
    let imageURL = URL.createObjectURL(image);
    //console.log(document.getElementById('rating-radio').checked);
    let sender = "";

    if (document.getElementById('individual').checked || document.getElementById('company').checked) {
        senderBtn = document.querySelector('input[name="sender"]:checked').value;
        if(senderBtn == 'individual'){
            sender = "Testimonials";
        }else{
            sender = "CompanyTestimonials";
        }
    } else {
        return alert("Please select the name options!");
    }

    
    document.querySelectorAll('input[name="rating-name"]').forEach((item) => {
        if(item.checked)
        {
            checked = true;
        }
    })

    //console.log(checked);

    if (!checked) {
        return alert("Please select the rating options!");
    } else {
        rating = document.querySelector('input[name="rating-name"]:checked').value;
    }

    const obj = new DynamicClass(sender, imageURL,testimony,name, rating);
    testimonialsOrigin.unshift(obj);
    //console.log(testimonials);
    addTestimonials(testimonialsOrigin);
}

function addTestimonials (testimonials) {

    // const testi1 = new Testimonials("https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "Outstanding service and results!", "John Doe");
    // const testi2 = new Testimonials("https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "Great price to quality ratio, totaly worth the price!", "Max Kennedy");
    // const testi3 = new CompanyTestimonials("https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "Cooperative and Communicative, understand costumer vision and needs, highly recommended.", "Quota");
    // let testimonials = [testi1,testi2,testi3];
    let html = "";

    testimonials.forEach((item) => {
        html += 
            `<a href="#">
            <div class="testi-card">
                <img src="${item.img}" alt="#" id="testi-img"/>
                <p id="testi-desc">${item.desc}</p>
                <div>
                <p id="testi-rate">${item.rating}<i class="fa-solid fa-star fa-xs"></i></p>
                <p id="testi-name">- ${item.name}</p>
                </div>
            </div>
            </a>`
    })

    document.getElementById("testimonials").innerHTML = html;
}