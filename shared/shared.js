var d = document
var w = window

function localization () {
  d.querySelectorAll('[data-i18n]').forEach((node) => {
    node.innerHTML = browser.i18n.getMessage(node.dataset.i18n)
  })
}

function filterMatch (needle, haystack) {
  var regex = new RegExp(needle, 'i')
  var match = false

  haystack.forEach(function (element) {
    if (regex.test(element)) match = true
  })

  return match
}

function scrollbarIsVisible (element) {
  return element.scrollHeight > element.clientHeight
}
