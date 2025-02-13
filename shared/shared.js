var d = document
var w = window

var defaultOptions = {
  'options': {
    trackContainer: true,
    ignoreNonHTTP: true,
    ignorePinned: false,
    formatCustom: "{container-url}{url}\r\n",
    filterTabs: true,
    customHeader: '', 
    containerBlacklist: ''
  }
}

function localization () {
  d.querySelectorAll('[data-i18n]').forEach(function (node) {
    var tag = node.tagName.toLowerCase()
    var translation = browser.i18n.getMessage(node.dataset.i18n)

    if (tag === 'input') {
      if (node.hasAttribute('placeholder')) {
        node.placeholder = translation
      } else {
        node.value = translation
      }
    } else {
      node.innerHTML = translation
    }
  })
}

/**
 * Determine whether a vertical scrollbar is visible within an element
 * @param  {Object} element
 * @return {Boolean}
 */
function hasScrollbar (element) {
  return element.scrollHeight > element.clientHeight
}
