function escapeHtml(html){
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

function selectOption(option) {
	// Curry function with option
	return function(e){
		chrome.storage.sync.set({
			'gasPriceOption': option
		});

		chrome.runtime.getBackgroundPage(backgroundPage=>{
			backgroundPage.updateBadge();
			updateDom();
			addClickListeners();
		});	
	};
}

function updateDom() {
	function renderDom(data) {
		let html = 
		`<div class="gasprice js-gasprice" data-option="slow">
			<span class="gasprice-label">Slow</span>
			<span class="gasprice-number">${escapeHtml(data.gasData.slow.gwei)}</span>
			<span class="gasprice-wait">${escapeHtml(data.gasData.slow.wait)}</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="standard">
			<span class="gasprice-label">Standard</span>
			<span class="gasprice-number">${escapeHtml(data.gasData.standard.gwei)}</span>
			<span class="gasprice-wait">${escapeHtml(data.gasData.standard.wait)}</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="fast">
			<span class="gasprice-label">Fast</span>
			<span class="gasprice-number">${escapeHtml(data.gasData.fast.gwei)}</span>
			<span class="gasprice-wait">${escapeHtml(data.gasData.fast.wait)}</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="rapid">
			<span class="gasprice-label">Rapid</span>
			<span class="gasprice-number">${escapeHtml(data.gasData.rapid.gwei)}</span>
			<span class="gasprice-wait">${escapeHtml(data.gasData.rapid.wait)}</span>
		</div>`;

		// Update dom
		document.getElementsByClassName('js-popup')[0].innerHTML = html;
		addClickListeners();

		// Show selected option
		chrome.storage.sync.get({
			'gasPriceOption': 'standard'
		}, (items)=>{
			let element = document.querySelectorAll(`div[data-option='${items.gasPriceOption}']`)[0];
			element.className += ' selected';
		});
	}

	chrome.runtime.getBackgroundPage(backgroundPage => {
		const data = backgroundPage.appData;
		if(typeof data.gasData.slow !== 'undefined') {
			renderDom(data);
		}
		else {
			backgroundPage.fetchGasPrice().then(()=>{
				updateDom(); // Let's try again after data has been fetched
			});
		}
	});
	
}

function addClickListeners() {
	// Add click listeners
	let elements = document.getElementsByClassName('js-gasprice');
	for(let i=0; i<elements.length; i++) {
		const element = elements[i];
		// Select option when clicked
		element.addEventListener('click', selectOption(element.dataset.option));
	}
}

function start() {
	updateDom();
	let settingsElement = document.getElementsByClassName('js-settings');
	settingsElement[0].addEventListener('click', ()=>{
		chrome.runtime.openOptionsPage();
	});
}

start();