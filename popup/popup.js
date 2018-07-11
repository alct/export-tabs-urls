var d = document
var w = window
var copyButton, counter, currentWindowId, exportButton, includeTitles, limitToWindow, nbWindows, os, textarea

// use proper namespace when run in Chrome
if (typeof chrome === 'object') var browser = chrome

browser.runtime.getPlatformInfo(function (info) {
  os = info.os
})

browser.windows.getAll(function (windowInfoArray) {
  nbWindows = windowInfoArray.length
})

browser.windows.getLastFocused(function (currentWindow) {
  currentWindowId = currentWindow.id
})

w.addEventListener('load', function () {
  counter = d.getElementsByClassName('counter')[0]
  textarea = d.getElementById('urls')
  includeTitles = d.getElementById('include-titles')
  limitToWindow = d.getElementById('limit-to-current-window')
  copyButton = d.getElementsByClassName('copy-button')[0]
  exportButton = d.getElementsByClassName('export-button')[0]

  if (nbWindows > 1) {
    limitToWindow.parentNode.classList.remove('hidden')
  }

  includeTitles.addEventListener('change', function () {
    updatePopup()
  })

  limitToWindow.addEventListener('change', function () {
    updatePopup()
  })

  copyButton.addEventListener('click', function () {
    if (copyButton.classList.contains('disabled')) return

    textarea.select()

    var message = d.execCommand('copy') ? 'copiedToClipboard' : 'notCopiedToClipboard'

    browser.notifications.create('ExportTabsURLs', {
      'type': 'basic',
      'title': browser.i18n.getMessage('appName'),
      'iconUrl': '../img/icon.svg',
      'message': browser.i18n.getMessage(message)
    })

    copyButton.classList.add('disabled')

    setTimeout(function () {
      browser.notifications.clear('ExportTabsURLs')
      copyButton.classList.remove('disabled')
    }, 3000)
  })

  exportButton.addEventListener('click', function () {
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

      if (includeTitles.checked) format = '{title}\r\n{url}\r\n\r\n'

      for (var i = 0; i < totalNbTabs; i++) {
        var tabWindowId = tabs[i].windowId

        if (limitToWindow.checked && tabWindowId !== currentWindowId) continue

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
