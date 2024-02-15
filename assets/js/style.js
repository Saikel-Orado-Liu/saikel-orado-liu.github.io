var style = document.getElementById("style");
var styleImg = document.getElementById("style-img");
var styleText = document.getElementById("style-text");

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
	styleImg.src = "/assets/img/sun.svg";
	styleText.setAttribute("id", "light-style");
	styleText = document.getElementById("light-style");
} else {
	styleImg.src = "/assets/img/moon.svg";
	styleText.setAttribute("id", "dark-style");
	styleText = document.getElementById("dark-style");
}

style.onclick = function() {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
		if(document.body.classList.contains("light-style")) document.body.classList.toggle("light-style");
		document.body.classList.toggle("dark-style");
		if (document.body.classList.contains("dark-style")) {
			styleImg.src = "/assets/img/moon.svg";
			styleText.setAttribute("id", "dark-style");
			styleText = document.getElementById("dark-style");
			updateText("dark-style");
		} else {
			styleImg.src = "/assets/img/sun.svg";
			styleText.setAttribute("id", "light-style");
			styleText = document.getElementById("light-style");
			updateText("light-style");
		}
	} else {
		if(document.body.classList.contains("dark-style")) document.body.classList.toggle("dark-style");
		document.body.classList.toggle("light-style");
		if (document.body.classList.contains("light-style")) {
			styleImg.src = "/assets/img/sun.svg";
			styleText.setAttribute("id", "light-style");
			styleText = document.getElementById("light-style");
			updateText("light-style");
		} else {
			styleImg.src = "/assets/img/moon.svg";
			styleText.setAttribute("id", "dark-style");
			styleText = document.getElementById("dark-style");
			updateText("dark-style");
		}
	}
}

async function updateText(id) {
	var language = getUserLanguage();
	var internationalizationData = await fetchInternationalization(language);
	if (internationalizationData) styleText.textContent = internationalizationData[id];
}