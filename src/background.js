var appData = {
  gasData: {},
  eip1559: {},
  network: 'mainnet'
};

const weiToGwei = 1000000000;

const eip1559ActivationBlock = 12965000;
let currentBlock = 0;

async function shouldShowEIP1559() {
  return new Promise(resolve => {
    if(currentBlock >= eip1559ActivationBlock) {
      resolve(true);
    }
    else {
      // If not yet activated, let's see if feature flag is active
      return chrome.storage.sync.get({
        eip1559: false,
      }, function(items) {
        resolve(items.eip1559);
      });
    }
  });
}

async function fetchFeeHistory(params) {
  return fetch("https://gasprice-proxy.herokuapp.com/latest")
  .then((r)=>{ return r.json(); }).then((d)=>{ return d});
}

chrome.alarms.create('fetch_gas_price', {
  "periodInMinutes": 1
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

async function updateBadge() {
  if(await shouldShowEIP1559()) {
    let network = appData.network;
    const bFLength = appData['eip1559'][network]['baseFeePerGas'].length;
    const currentBaseFee = appData['eip1559'][network]['baseFeePerGas'][bFLength-1];
    const baseFeeFormatted = parseInt(Number(currentBaseFee), 10)/weiToGwei;
    chrome.browserAction.setBadgeText({text: String(baseFeeFormatted)});
  }
  else {
    chrome.storage.sync.get({
      gasPriceOption: "standard",
    }, function(items) {
      const gasPrice = appData.gasData[items.gasPriceOption].gwei;
      chrome.browserAction.setBadgeText({text: String(gasPrice)});
    });
  }
}

function getProviderUrl(provider) {
  switch(provider) {
    case 'ethgasstation':
      // return "https://gasprice-proxy.herokuapp.com/"; // Firefox specific proxy
      return "https://ethgasstation.info/api/ethgasAPI.json?api-key=d216b81e8ed8f5c8a82744be99b22b2d1757098f40df3c2ea5bb40b3912b";
      break;
    case 'gasnow':
      return "https://www.gasnow.org/api/v3/gas/price?utm_source=EthGasPriceExtension";
      break;
    case 'ethgaswatch':
      return "https://gasprice-proxy.herokuapp.com/provider/ethgaswatch";
      break;
  }
}

async function fetchGasPrice() {
  return new Promise(async (resolve, reject)=>{
    if(await shouldShowEIP1559()) {
      appData['eip1559'] = await fetchFeeHistory();

      updateBadge(); 

      resolve();
    }
    else {
      chrome.storage.sync.get({
        provider: "ethgasstation",
      }, function(items) {
        const url = getProviderUrl(items.provider);

        fetch(url).then((res) => {return res.json()})
        .then(data => {
          // Store the current data for the popup page
          appData.gasData = parseApiData(data, items.provider);
          // Update badge
          updateBadge();

          // Resolve promise on success
          resolve();
        })
        .catch((error) => {
          reject();
        });
      });
    }
  });
}

// Create a consistent structure for data so we can use multiple providers
function parseApiData(apiData, provider) {
  if(provider === "ethgasstation") {
    return {
      "slow": {
        "gwei": parseInt(apiData.safeLow, 10)/10,
        "wait": "~"+apiData.safeLowWait + " minutes"
      },
      "standard": {
        "gwei": parseInt(apiData.average, 10)/10,
        "wait": "~"+apiData.avgWait + " minutes"
      },
      "fast": {
        "gwei": parseInt(apiData.fast, 10)/10,
        "wait": "~"+apiData.fastWait + " minutes"
      },
      "rapid": {
        "gwei": parseInt(apiData.fastest, 10)/10,
        "wait": "~"+apiData.fastestWait + " minutes"
      }
    }
  }

  if(provider === "gasnow") {
    return {
      "slow": {
        "gwei": Math.floor(parseInt(apiData.data.slow, 10)/1000000000),
        "wait": ">10 minutes"
      },
      "standard": {
        "gwei": Math.floor(parseInt(apiData.data.standard, 10)/1000000000),
        "wait": "~3 minutes"
      },
      "fast": {
        "gwei": Math.floor(parseInt(apiData.data.fast, 10)/1000000000),
        "wait": "~1 minute"
      },
      "rapid": {
        "gwei": Math.floor(parseInt(apiData.data.rapid, 10)/1000000000),
        "wait": "~15 seconds"
      }
    }
  }

  if(provider === "ethgaswatch") {
    return {
      "slow": {
        "gwei": parseInt(apiData.slow.gwei, 10),
        "wait": "<30 minutes"
      },
      "standard": {
        "gwei": parseInt(apiData.normal.gwei, 10),
        "wait": "<5 minutes"
      },
      "fast": {
        "gwei": parseInt(apiData.fast.gwei, 10),
        "wait": "<2 minutes"
      },
      "rapid": {
        "gwei": parseInt(apiData.instant.gwei, 10),
        "wait": "few seconds"
      }
    }
  }
  
}

fetchGasPrice(); // Initial fetch