var style = document.getElementById("theme-style");
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    style.src = "/assets/img/moon.svg";
} else {
    style.src = "/assets/img/sun.svg";
}
style.onclick = function() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        if(document.body.classList.contains("light-style")) document.body.classList.toggle("light-style");
        document.body.classList.toggle("dark-style");
        if (document.body.classList.contains("dark-style")) {
            style.src = "/assets/img/sun.svg";
        } else {
            style.src = "/assets/img/moon.svg";
        }
    } else {
        if(document.body.classList.contains("dark-style")) document.body.classList.toggle("dark-style");
        document.body.classList.toggle("light-style");
        if (document.body.classList.contains("light-style")) {
            style.src = "/assets/img/moon.svg";
        } else {
            style.src = "/assets/img/sun.svg";
        }
    }
}