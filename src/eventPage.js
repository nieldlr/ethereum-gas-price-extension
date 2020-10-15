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
  
  // const url = "https://ethgasstation.info/api/ethgasAPI.json?api-key=d216b81e8ed8f5c8a82744be99b22b2d1757098f40df3c2ea5bb40b3912b";
  // return fetch(url)
  //   .then((res) => {return res.json()})
  //   .then(data => {
  //     // Store the current data for the popup page
  //     appData.ethGasStationData = data;
  //     // Update badge
  //     updateBadge();
  //   });

  const url = "https://gasprice-proxy.herokuapp.com/"; // Firefox Proxy
  return fetch(url)
    .then((res) => {return res.json()})
    .then(data => {
      // Store the current data for the popup page
      appData.ethGasStationData = data;
      // Update badge
      updateBadge();
    });
}

fetchGasPrice(); // Initial fetch