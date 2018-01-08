chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 3
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function fetchGasPrice() {
  fetch("https://ethgasstation.info/json/ethgasAPI.json")
    .then((res) => {return res.json()})
    .then(data => {
      chrome.browserAction.setBadgeText({text: String(parseInt(data.average, 10)/10)});
    });
}

fetchGasPrice(); // Initial fetch