document.addEventListener("DOMContentLoaded", () => {
	const userLang = getUserLanguage();
	updateUI(userLang, null);
	fetchInternationalization(userLang)
		.then(data => updateUI(userLang ,data))
		.then(enableLanguageButtons)
		.catch(handleError);
});

function getUserLanguage() {
	let userLang = localStorage.getItem("userLang") || navigator.language || navigator.userLanguage;
	localStorage.setItem("userLang", userLang);
	return userLang;
}

async function fetchInternationalization(language) {
	const response = await fetch(`/assets/i18n/${language}.json`);
	if (!response.ok) throw new Error('Failed to fetch internationalization data');
	return response.json();
}

function updateUI(lang, data) {
	updateListOrder(lang);
	const i18nTexts = document.querySelectorAll(".i18n");
	i18nTexts.forEach(text => {
		const id = text.getAttribute("id");
		const element = document.getElementById(id);
		element.style.display = "none";
		if (data) {
			element.textContent = data[id];
			element.style.display = "block";
		}
	});
}

function updateListOrder(lang) {
	var list = document.getElementById('langList');
	var listItems = Array.from(document.querySelectorAll('#langList li'));
	listItems.forEach(item => {
		var button = item.querySelector('a');
		if (button.getAttribute("data-lang") === lang) {
			var index = listItems.indexOf(item);
			listItems.splice(index, 1);
			listItems.unshift(item);
		}
	});
	// 重新排序剩余的元素
	var firstItem = listItems.shift();
	listItems.sort((a, b) => {
		var langA = a.querySelector('a').getAttribute("data-lang");
		var langB = b.querySelector('a').getAttribute("data-lang");
		return langA.localeCompare(langB);
	});
	listItems.unshift(firstItem);
	list.innerHTML = '';
	listItems.forEach(item => list.appendChild(item));
}

function handleError(error) {
	console.error('Error loading internationalization data:', error);
	showErrorToUser();
	enableLanguageButtons();
}

function enableLanguageButtons() {
	const languageButtons = document.querySelectorAll(".langButton");
	languageButtons.forEach(button => {
		button.addEventListener("click", () => {
			const userLang = button.getAttribute("data-lang");
			localStorage.setItem("userLang", userLang);
			fetchInternationalization(userLang)
				.then(data => updateUI(userLang ,data))
				.catch(handleError);
		});
	});
}

function showErrorToUser() {
	// 在页面上显示错误消息
}
