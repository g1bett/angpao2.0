const buttonYes = document.getElementById("buttonYes");
const buttonNo = document.getElementById("buttonNo");

buttonNoText = ["engga", "bagi plis", "dikitt aja", "pliss"];
let klik = 0;

buttonNo.addEventListener("click", function() {
    buttonNo.textContent = buttonNoText[klik];
    if (klik < buttonNoText.length + 1) {
        klik++;
    }

    if (klik > buttonNoText.length) {
        buttonNo.style.display = "none"
    }

    buttonYes.style.fontSize = (25 * klik + 10) + "px";
}
);

buttonYes.addEventListener("click", function() {
    window.location.href = "angpao.html";
}
);