document.addEventListener("DOMContentLoaded", function() {
	var userLang = getUserLanguage();
	// 显示默认提示
	updateUI(null);
	fetchInternationalization(userLang).then(function(data) {
		internationalizationData = data;
		updateUI(internationalizationData);
		enableLanguageButtons();
	}).catch(function(error) {
		console.error('Error loading internationalization data:', error);
		// 显示错误消息给用户
		showErrorToUser();
		// 仍然启用语言按钮，以便用户可以重新尝试加载
		enableLanguageButtons();
	});
});

function getUserLanguage() {
	var userLang = localStorage.getItem("userLang");
	if (!userLang) {
		userLang = navigator.language || navigator.userLanguage;
		localStorage.setItem("userLang", userLang);
	}
	return userLang;
}

async function fetchInternationalization(language) {
	const response = await fetch('/assets/i18n/' + language + '.json');
	if (!response.ok) throw new Error('Failed to fetch internationalization data');
	const data = await response.json();
	// 提前加载用户选择的语言的本地化数据到内存中
	internationalizationData = data;
	return data;
}

function updateUI(internationalizationData) {
	var i18nTexts = document.querySelectorAll(".i18n");
	i18nTexts.forEach(text => {
		var id = text.getAttribute("id");
		var element = document.getElementById(id);
		element.style.display = "none"; // 隐藏问候语

		if (internationalizationData) {
			element.textContent = internationalizationData[id];
			element.style.display = "block"; // 显示问候语
		}
	});
}

function showErrorToUser() {
	// 在页面上显示错误消息
}

function enableLanguageButtons() {
	var languageButtons = document.querySelectorAll(".langButton");
	languageButtons.forEach(function(button) {
		button.addEventListener("click", function() {
			var userLang = button.getAttribute("data-lang");
			localStorage.setItem("userLang", userLang);
			fetchInternationalization(userLang).then(function(data) {
				internationalizationData = data;
				updateUI(internationalizationData);
			}).catch(function(error) {
				console.error('Error loading internationalization data:', error);
				// 显示错误消息给用户
				showErrorToUser();
			});
		});
	});
}
