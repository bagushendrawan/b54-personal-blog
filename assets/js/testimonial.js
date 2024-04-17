let testimonials = [];

class Testimonials {
    constructor(img, desc, name)
    {
        this.img = img;
        this.desc = desc;
        this.name = name;
    }
}

class CompanyTestimonials extends Testimonials {
    constructor(img, desc, name)
    {
        super(img, desc, name + " Company");
    }
}

const classes = {
    Testimonials,
    CompanyTestimonials
}

class DynamicClass {
    constructor (className, img, desc, name) {
        return new classes[className](img, desc, name);
    }
}

function testimonialsAddButton (event) {
    event.preventDefault();
    let name = document.getElementById("name").value;
    let testimony = document.getElementById("testimony").value;
    let image = document.getElementById("file").files[0];
    let imageURL = URL.createObjectURL(image);

    let sender = "";

    if (document.getElementById('individual').checked || document.getElementById('company').checked) {
        if(sender == 'individual'){
            sender = "Testimonials";
        }else{
            sender = "CompanyTestimonials";
        }
    } else {
        return alert("Please select the name options!");
    }

    const obj = new DynamicClass(sender, imageURL,testimony,name);
    testimonials.unshift(obj);
    console.log(testimonials);
    addTestimonials(testimonials);
}

function addTestimonials (testimonials) {

    // const testi1 = new Testimonials("https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "Outstanding service and results!", "John Doe");
    // const testi2 = new Testimonials("https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "Great price to quality ratio, totaly worth the price!", "Max Kennedy");
    // const testi3 = new CompanyTestimonials("https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "Cooperative and Communicative, understand costumer vision and needs, highly recommended.", "Quota");
    // let testimonials = [testi1,testi2,testi3];
    let html = "";

    for(let i = 0; i<testimonials.length; i++)
    {
            html += 
            `<a href="#">
            <div class="testi-card">
                <img src="${testimonials[i].img}" alt="#" id="testi-img"/>
                <p id="testi-desc">${testimonials[i].desc}</p>
                <p id="testi-name">- ${testimonials[i].name}</p>
            </div>
            </a>`
    }

    document.getElementById("testimonials").innerHTML = html;
}