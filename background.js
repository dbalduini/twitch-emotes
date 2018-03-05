/* global chrome, fetch */
const url = chrome.extension.getURL('config.json')

fetch(url)
.then(response => response.json())
.then(config => {
  chrome.storage.sync.set({ 'config': config }, function () {
    console.log('Settings saved')
  })
})
