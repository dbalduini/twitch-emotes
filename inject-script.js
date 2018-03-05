/* global chrome */

function injectScript (file, tag) {
  let node = document.getElementsByTagName(tag)[0]
  let script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file)
  node.appendChild(script)
}

injectScript(chrome.extension.getURL('scripts/chat-input.js'), 'body')
