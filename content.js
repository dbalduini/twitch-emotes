/* global chrome, CustomEvent */
let Config = {}

// document.querySelectorAll('.emote-picker__emote-figure')

const replaceLastWord = (s, i, w) => s.substring(0, i) + w

chrome.storage.local.get('config', function (data) {
  Config = data.config
  Config.emoteNames = Object.keys(Config.faceEmotes)
  console.log(Config)
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
    const text = this.value
    const word = getLastTypedWord(text)
    const emotes = filterEmotes(word.val)
    const emoteNodes = emotes.map(createEmoteOption)

    // Hide the emote picker and update the text with the correct spelling
    const onEmoteClick = function () {
      removeChildNodes(picker)
      let emoteName = this.getAttribute('data-emote')
      let newText = replaceLastWord(text, word.start, emoteName)
      setChatText(newText)
    }

    removeChildNodes(picker)

    emoteNodes.forEach(emote => {
      emote.addEventListener('click', onEmoteClick)
      picker.appendChild(emote)
    })
  })
}

function getLastTypedWord (text) {
  if (text.length === 0) {
    return text
  }
  let start = text.lastIndexOf(' ') + 1
  let end = text.length
  let val = text.substring(start, end)

  return {
    start,
    end,
    val
  }
}

function filterEmotes (word) {
  if (!word) {
    return []
  }
  return Config.emoteNames.filter(w => w.toLowerCase().startsWith(word))
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
  emote.src = Config.faceEmotes[name]
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
