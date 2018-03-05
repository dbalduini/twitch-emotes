/* global chrome, CustomEvent */
let Config = {}

chrome.storage.sync.get('config', function (data) {
  Config = data.config
  waitUntilChatAvailable(setup)
})

function waitUntilChatAvailable (callback) {
  const retry = function () {
    setTimeout(function () {
      waitUntilChatAvailable(callback)
    }, 200)
  }

  if (document.readyState === 'complete') {
    const chat = document.querySelector('textarea')
    if (chat) {
      callback(chat)
    } else {
      retry()
    }
  } else {
    retry()
  }
}

function setup (chat) {
  const picker = injectEmotePicker(chat)

  chat.addEventListener('input', function () {
    const emotes = filterEmotes(this.value)
    const emoteNodes = emotes.map(createEmoteOption)

    // Hide the emote picker and update the text with the correct spelling.
    const onEmoteClick = function () {
      removeChildNodes(picker)
      setChatText(this.getAttribute('data-emote'))
    }

    removeChildNodes(picker)

    emoteNodes.forEach(emote => {
      emote.addEventListener('click', onEmoteClick)
      picker.appendChild(emote)
    })
  })
}

function filterEmotes (val) {
  if (!val) {
    return []
  }
  val = val.toLowerCase()
  return Config.emoteNames.filter(emote => emote.toLowerCase().startsWith(val))
}

/**
 * Inject the Emote Picker element and return it.
 * @param {Element} chat - The chat element
 * @returns {Element} Emote Picker
 */
function injectEmotePicker (chat) {
  const picker = document.createElement('div')
  const balloonUP = document.createElement('div')

  balloonUP.style.backgroundColor = 'white'

  balloonUP.setAttribute('class',
    'tw-balloon tw-balloon--md tw-balloon--up ' +
    'tw-balloon--right tw-block tw-absolute')

  balloonUP.appendChild(picker)
  chat.parentElement.parentNode.insertBefore(balloonUP, chat.parentElement)
  return picker
}

/**
 * Create a div node with emote properties.
 * @param {string} name - The emote name
 */
function createEmoteOption (emote) {
  const option = document.createElement('div')
  option.classList = [ 'remembrall-option' ]
  option.setAttribute('data-emote', emote)
  option.appendChild(createEmoteNode(emote))
  option.appendChild(document.createTextNode(emote))
  return option
}

/**
 * Create an img node with emote properties.
 * @param {string} name - The emote name
 */
function createEmoteNode (name) {
  const emote = document.createElement('img')
  emote.src = Config.emoteIcons[name]
  emote.alt = name
  emote.classList = ['chat-image', 'chat-line__message--emote', 'tw-inline-block']
  return emote
}

/**
 * Remove all child nodes from some node.
 * @param {object} node - The DOM node
 */
function removeChildNodes (node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild)
  }
}

function setChatText (text) {
  const e = new CustomEvent('remembrall_chat', {'detail': {'text': text}})
  document.dispatchEvent(e)
}
