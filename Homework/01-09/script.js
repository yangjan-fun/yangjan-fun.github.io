

var myName = "Janne";

var salutation = "Hello, I am " + myName + "!";

var message = `${myName} likes to code!`;

console.log(myName);

console.log(message);

document.querySelector("#greeting").innerHTML = salutation + " " + message;

document.querySelector("p").style.color = "red";

function changeColor(color) {
    document.querySelector("p").style.color = color;
}


document.querySelector("#clickToChangeColor").onclick = function() {
    changeColor("green");
}

function changeImage() {
    document.querySelector("img").src = "./images/cat2.jpg";
}

document.querySelector("#clickToChangeImage").onclick = function() {
    changeImage();
}
