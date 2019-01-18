var d = document
var w = window

function localization () {
  d.querySelectorAll('[data-i18n]').forEach((node) => {
    node.innerHTML = browser.i18n.getMessage(node.dataset.i18n)
  })
}
