const options = {
  'provider': ''
};

chrome.storage.sync.get({
  'provider': 'ethgasstation'
}, (items)=>{
  options.provider = items.provider;
  renderOptions();
});

function renderOptions(){
  let providersHtml = 
    `<li data-provider="ethgasstation" class="js-provider ${options.provider == 'ethgasstation' ? 'active':''}">Eth Gas Station ${options.provider == 'ethgasstation' ? '✓':''}</li>
    <li data-provider="gasnow" class="js-provider ${options.provider == 'gasnow' ? 'active':''}">Gas Now ${options.provider == 'gasnow' ? '✓':''}</li>`;

  document.getElementsByClassName('js-providers')[0].innerHTML = providersHtml;
  addClickListeners();
}

function selectProvider(option) {
  // Curry function with option
  return function(e){
    options.provider = option;
    chrome.storage.sync.set({
      'provider': option
    });

    renderOptions();

    chrome.runtime.getBackgroundPage(backgroundPage=>{
      backgroundPage.fetchGasPrice();
      // updateDom();
      // addClickListeners();
    }); 


    // chrome.runtime.getBackgroundPage(backgroundPage=>{
    //   backgroundPage.updateBadge();
    //   updateDom();
    //   addClickListeners();
    // }); 
  };
}

function addClickListeners() {
  // Add click listeners
  let elements = document.getElementsByClassName('js-provider');
  for(let i=0; i<elements.length; i++) {
    const element = elements[i];
    // Select option when clicked
    element.addEventListener('click', selectProvider(element.dataset.provider));
  }
}