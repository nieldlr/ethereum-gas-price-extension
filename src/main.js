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
	chrome.runtime.getBackgroundPage(backgroundPage=>{
		const data = backgroundPage.appData;
		let html = 
		`<div class="gasprice js-gasprice" data-option="safeLow">
			<span class="gasprice-number" >${data.ethGasStationData.safeLow/10}</span>
			<span class="gasprice-label">Safe Low</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="average">
			<span class="gasprice-number data-option="average">${data.ethGasStationData.average/10}</span>
			<span class="gasprice-label">Standard</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="fast">
			<span class="gasprice-number">${data.ethGasStationData.fast/10}</span>
			<span class="gasprice-label">Fast</span>
		</div>`;

		// Update dom
		document.getElementsByClassName('js-popup')[0].innerHTML = html;
		addClickListeners();

		// Show selected option
		chrome.storage.sync.get({
			'gasPriceOption': 'average'
		}, (items)=>{
			let element = document.querySelectorAll(`div[data-option='${items.gasPriceOption}']`)[0];
			element.className += ' selected';
		});	
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
}

start();