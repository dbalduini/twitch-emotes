/* global chrome, fetch */
const url = chrome.extension.getURL('config.json')

fetch(url)
.then(response => response.json())
.then(config => {
  chrome.storage.local.set({ 'config': config }, function () {
    console.log('Settings saved')
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  // Only exists if the url changed
  if (changeInfo.url) {
    // Notify the content script that the url has changed
    chrome.tabs.sendMessage(tabId, {action: 'url_changed'})
  }
})
