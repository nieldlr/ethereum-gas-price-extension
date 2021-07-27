const weiToGwei = 1000000000;
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

async function updateDom() {
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
		document.getElementsByClassName('js-popup')[0].innerHTML = DOMPurify.sanitize(html);
		addClickListeners();

		// Show selected option
		chrome.storage.sync.get({
			'gasPriceOption': 'standard'
		}, (items)=>{
			let element = document.querySelectorAll(`div[data-option='${items.gasPriceOption}']`)[0];
			element.className += ' selected';
		});
	}

	function renderEIP1559(data) {
		let currentData = data.eip1559;
		let network = data.network;
		const bFLength = currentData[network]['baseFeePerGas'].length;
	    const currentBaseFee = currentData[network]['baseFeePerGas'][bFLength-1];
	    const baseFeeFormatted = parseInt(Number(currentBaseFee), 10)/weiToGwei;

		let html = 
		`<div class="gasprice js-gasprice" data-option="basefee">
			<span class="gasprice-label">Base Fee</span>
			<span class="gasprice-number">${escapeHtml(baseFeeFormatted)}</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="basefee-recommended">
			<span class="gasprice-label">Recommended Base Fee</span>
			<span class="gasprice-number">${escapeHtml(baseFeeFormatted*2)}</span>
		</div>`;

		// Update dom
		document.getElementsByClassName('js-popup')[0].innerHTML = DOMPurify.sanitize(html);
		addClickListeners();
	}

	chrome.runtime.getBackgroundPage(async (backgroundPage) => {
		const data = backgroundPage.appData;
		if(await backgroundPage.shouldShowEIP1559()) {
			if(typeof data.eip1559.mainnet !== 'undefined') {
				renderEIP1559(data);
			}
			else {
				backgroundPage.fetchGasPrice().then(()=>{
					updateDom(); // Let's try again after data has been fetched
				});
			}
		}
		else {
			if(typeof data.gasData.slow !== 'undefined') {
				renderDom(data);
			}
			else {
				backgroundPage.fetchGasPrice().then(()=>{
					updateDom(); // Let's try again after data has been fetched
				});
			}
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
	// Show latest data if we have it
	updateDom();

	// Fetch newest data upon opening
	chrome.runtime.getBackgroundPage(backgroundPage => {
		backgroundPage.fetchGasPrice().then(()=>{
			updateDom(); // Let's try again after data has been fetched
		});
	});

	// Add click listener to settings button
	let settingsElement = document.getElementsByClassName('js-settings');
	settingsElement[0].addEventListener('click', ()=>{
		chrome.runtime.openOptionsPage();
	});
}

start();