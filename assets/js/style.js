var style = document.getElementById("style");
var styleImg = document.getElementById("style-img");
var styleText = document.getElementById("style-text");

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
	styleImg.classList.remove("bx-moon");
	styleImg.classList.add("bx-sun");
	styleText.setAttribute("id", "light-style");
} else {
	styleImg.classList.remove("bx-sun");
	styleImg.classList.add("bx-moon");
	styleText.setAttribute("id", "dark-style");
}

style.onclick = function() {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
		if(document.body.classList.contains("light-style")) document.body.classList.toggle("light-style");
		document.body.classList.toggle("dark-style");
		if (document.body.classList.contains("dark-style")) toggleDark(); else toggleLight();
	} else {
		if(document.body.classList.contains("dark-style")) document.body.classList.toggle("dark-style");
		document.body.classList.toggle("light-style");
		if (document.body.classList.contains("light-style")) toggleLight(); else toggleDark();
	}
}

function toggleDark() {
	styleImg.classList.remove("bx-sun");
	styleImg.classList.add("bx-moon");
	styleText.setAttribute("id", "dark-style");
	styleText = document.getElementById("dark-style");
	updateText("dark-style");
}

function toggleLight() {
	styleImg.classList.remove("bx-moon");
	styleImg.classList.add("bx-sun");
	styleText.setAttribute("id", "light-style");
	styleText = document.getElementById("light-style");
	updateText("light-style");
}

async function updateText(id) {
	var language = getUserLanguage();
	var internationalizationData = await fetchInternationalization(language);
	if (internationalizationData) styleText.textContent = internationalizationData[id];
}