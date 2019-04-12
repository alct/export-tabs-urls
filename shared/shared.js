var d = document
var w = window

var defaultOptions = {
  'options': {
    ignoreNonHTTP: true,
    ignorePinned: false,
    formatCustom: '',
    filterTabs: true
  }
}

var defaultPopupStates = {
  'states': {
    format: false,
    popupLimitWindow: false
  }
}

function localization () {
  d.querySelectorAll('[data-i18n]').forEach((node) => {
    node.innerHTML = browser.i18n.getMessage(node.dataset.i18n)
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
