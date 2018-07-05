var d = document
var w = window
var checkbox, copybutton, counter, exportbutton, os, textarea

// use proper namespace when run in Chrome
if (typeof chrome === 'object') var browser = chrome

browser.runtime.getPlatformInfo(function (info) {
  os = info.os
})

w.addEventListener('load', function () {
  counter = d.getElementsByClassName('counter')[0]
  copybutton = d.getElementsByClassName('copy-button')[0]
  exportbutton = d.getElementsByClassName('export-button')[0]
  checkbox = d.getElementById('include-titles')
  textarea = d.getElementById('urls')

  checkbox.addEventListener('change', function () {
    updatePopup()
  })

  copybutton.addEventListener('click', function () {
    if (copybutton.classList.contains('disabled')) return

    textarea.select()

    var message = d.execCommand('copy') ? 'copiedToClipboard' : 'notCopiedToClipboard'

    browser.notifications.create('ExportTabsURLs', {
      'type': 'basic',
      'title': browser.i18n.getMessage('appName'),
      'iconUrl': '../img/icon.svg',
      'message': browser.i18n.getMessage(message)
    })

    copybutton.classList.add('disabled')

    setTimeout(function () {
      browser.notifications.clear('ExportTabsURLs')
      copybutton.classList.remove('disabled')
    }, 3000)
  })

  exportbutton.addEventListener('click', function () {
    var list = textarea.value

    // fix inconsistent behaviour on Windows
    // see https://github.com/alct/export-tabs-urls/issues/2
    if (os === 'win') list = list.replace(/\r?\n/g, '\r\n')

    download(list)
  })

  updatePopup()

  localization()
})

function updatePopup () {
  browser.tabs.query(
    {},
    function (tabs) {
      var list = ''
      var format = '{url}\r\n'
      var actualNbTabs = 0
      var totalNbTabs = tabs.length

      if (checkbox.checked) format = '{title}\r\n{url}\r\n\r\n'

      for (var i = 0; i < totalNbTabs; i++) {
        var uri = URI(tabs[i].url)
        var protocol = uri.protocol()

        if (protocol === 'http' || protocol === 'https') {
          list += format.replace(/{title}/g, tabs[i].title)
                        .replace(/{url}/g, tabs[i].url)
          actualNbTabs += 1
        }
      }

      textarea.value = list
      counter.textContent = actualNbTabs
    }
  )
}

function localization () {
  d.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = browser.i18n.getMessage(node.dataset.i18n)
  })
}

function download (list) {
  var element = d.createElement('a')
  element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(list)
  element.download = moment().format('YYYYMMDDTHHmmssZZ') + '_ExportTabsURLs.txt'
  element.style.display = 'none'

  d.body.appendChild(element)

  element.click()

  d.body.removeChild(element)
}
