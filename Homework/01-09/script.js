

var myName = "Janne";

var salutation = "Hello, I am " + myName + "!";

var message = `${myName} likes ocean!`;

console.log(myName);

console.log(message);

document.querySelector("#greeting").innerHTML = salutation + " " + message;

document.querySelector("p").style.color = "black";

function changeColor(color) {
    document.querySelector("p").style.color = color;
}


document.querySelector("#clickToChangeColor").onclick = function() {
    changeColor("lightblue");
}

function changeImage() {
    document.querySelector("img").src = "./images/img2.jpg";
}

document.querySelector("#clickToChangeImage").onclick = function() {
    changeImage();
}
