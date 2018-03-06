/* global chrome, CustomEvent */

const COMMAND_KEY = '?'
const replaceLastWord = (s, i, w) => s.substring(0, i) + w

let Config = {}
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
    removeChildNodes(picker)
    if (text.trim().length > 0) {
      updateEmotePicker(picker, text)
    }
  })

  chat.addEventListener('keyup', function (e) {
    // Key TAB pressed
    if (e.which === 9) {
      e.preventDefault()
      e.stopPropagation()
      let text = e.target.textContent
      pickFirstEmote(picker, text)
      removeChildNodes(picker)
    }
  })
}

function pickFirstEmote (picker, text) {
  let emoteNodes = document.querySelectorAll('.remembrall-option')

  if (!emoteNodes) {
    return
  }

  let firstEmoteName = emoteNodes[0].getAttribute('data-emote')

  // remove the last space
  let word = getLastTypedWord(text.slice(0, -1))
  let newText = replaceLastWord(text, word.start, firstEmoteName)

  // append the removed space again
  setChatText(newText + ' ')
}

function updateEmotePicker (picker, text) {
  let word = getLastTypedWord(text)

  if (!word.isCommand) {
    return false
  }

  let emotes = filterEmotes(word.val)
  let emoteNodes = emotes.map(createEmoteOption)

  // Hide the emote picker and update the text with the correct spelling
  const pickEmote = function () {
    removeChildNodes(picker)
    let emoteName = this.getAttribute('data-emote')
    let newText = replaceLastWord(text, word.start, emoteName)
    setChatText(newText)
  }

  emoteNodes.forEach(emote => {
    emote.addEventListener('click', pickEmote)
    picker.appendChild(emote)
  })
}

function getLastTypedWord (text) {
  let start = text.lastIndexOf(' ') + 1
  let end = text.length
  let val = text.substring(start, end)
  let isCommand = text[0] === COMMAND_KEY

  if (isCommand) {
    // remove the first char
    val = val.slice(1)
  }

  return {
    start,
    end,
    val,
    isCommand
  }
}

function filterEmotes (word) {
  if (!word) {
    return []
  }
  const compare = w => w.toLowerCase().startsWith(word.toLowerCase())
  return Config.emoteNames.filter(compare)
}

/**
 * Inject the Emote Picker element and return it.
 * @param {Element} chat - The chat element
 * @returns {Element} Emote Picker
 */
function injectEmotePicker (chat) {
  const picker = document.createElement('div')
  const balloonUP = document.createElement('div')

  picker.classList.add('remembrall-picker')

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
  const emoteNode = createEmoteNode(emote)
  const div = document.createElement('div')

  option.classList = [ 'remembrall-option' ]
  option.setAttribute('data-emote', emote)

  div.classList.add('emote-icon')
  div.appendChild(emoteNode)

  option.appendChild(div)
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
