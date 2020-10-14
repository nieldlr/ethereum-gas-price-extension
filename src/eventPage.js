var appData = {
  gasData: {}
};

chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 3
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "standard",
  }, function(items) {
    const gasPrice = appData.gasData[items.gasPriceOption].gwei;
    chrome.browserAction.setBadgeText({text: String(gasPrice)});
  });
}

function fetchGasPrice() {
  const url = "https://ethgasstation.info/api/ethgasAPI.json?api-key=d216b81e8ed8f5c8a82744be99b22b2d1757098f40df3c2ea5bb40b3912b";
  return fetch(url)
    .then((res) => {return res.json()})
    .then(data => {
      // Store the current data for the popup page
      appData.gasData = parseGasData(data);
      // Update badge
      updateBadge();
    });

  // const url = "https://gasprice-proxy.herokuapp.com/"; // Firefox Proxy
  // return fetch(url)
  //   .then((res) => {return res.json()})
  //   .then(data => {
  //     // Store the current data for the popup page
  //     appData.gasData = data;
  //     // Update badge
  //     updateBadge();
  //   });
}

// Create a consistent structure for data so we can use multiple providers
function parseGasData(gasData) {
  return {
    "slow": {
      "gwei": parseInt(gasData.safeLow, 10)/10,
      "wait": gasData.safeLowWait
    },
    "standard": {
      "gwei": parseInt(gasData.average, 10)/10,
      "wait": gasData.avgWait
    },
    "fast": {
      "gwei": parseInt(gasData.fast, 10)/10,
      "wait": gasData.fastWait
    },
    "rapid": {
      "gwei": parseInt(gasData.fastest, 10)/10,
      "wait": gasData.fastestWait
    }
  }
}

fetchGasPrice(); // Initial fetch