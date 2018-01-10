var appData = {
  ethGasStationData: {}
};

chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 3
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "average",
  }, function(items) {
    const gasPrice = appData.ethGasStationData[items.gasPriceOption];
    chrome.browserAction.setBadgeText({text: String(parseInt(gasPrice, 10)/10)});
  });
}

function fetchGasPrice() {
  fetch("https://ethgasstation.info/json/ethgasAPI.json")
    .then((res) => {return res.json()})
    .then(data => {
      // Store the current data for the popup page
      appData.ethGasStationData = data;
      // Update badge
      updateBadge();
    });
}

fetchGasPrice(); // Initial fetch