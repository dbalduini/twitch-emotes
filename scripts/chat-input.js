(function () {
  'use strict'

  let reactInstance = null

  // Returns the react instance for the given element
  function findReactInstance (el) {
    for (const key in el) {
      if (key.startsWith('__reactInternalInstance$')) {
        const fiberNode = el[key]
        return fiberNode && fiberNode.return && fiberNode.return.stateNode
      }
    }
    return null
  }

  // Update the chat by changing the React component state
  function updateChatText (text) {
    const chat = document.querySelector('textarea')
    const evt = {target: { value: text }}

    if (!reactInstance) {
      reactInstance = findReactInstance(chat)
    }

    if (reactInstance) {
      let prop = reactInstance.props.children.props
      prop.onChange(evt)
      prop.onFocus()
    } else {
      console.error('Cound not find the react component for:', chat)
    }
  }

  // Listen to content script
  document.addEventListener('remembrall_chat', function (e) {
    updateChatText(e.detail.text)
  })
}())
