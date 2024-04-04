function submitHandler() {
 let name = document.getElementById("name").value;
 let email = document.getElementById("email").value;
 let phone = document.getElementById("phone").value;
 let subject = document.getElementById("subject").value;
 let message = document.querySelector("#message").value;

 if(name == "") 
 {
    return alert("please type your name!");
 } else if (email == "") {
    return alert("please type your email!");
 } else if (phone == "") {
    return alert("please type your phone!");
 } else if (subject == "") {
    return alert("please type your subject!");
 } else if (message == "") {
    return alert("please type your message!");
 }

 const data = {
    name,email,phone,subject,message
 }

 const yourEmail = "bagushendrawan892@gmail.com";

 let a = document.createElement("a");
 a.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${yourEmail}&su=${subject}&body=${message}`;

 a.click();

 console.log(data);

}