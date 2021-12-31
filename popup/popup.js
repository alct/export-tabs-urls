var
  popupButtonSettings, popupCounter, popupTextarea, popupTextareaContainer, popupFilterTabs, popupFilterTabsContainer,
  popupButtonCopy, popupButtonExport, popupCustomFileName,
  popupFormat, popupLabelFormatTitles, popupLabelFormatCustom, popupLimitWindow, popupExportHTMLNetscapeFormat,
  currentWindowId, os,
  optionsIgnoreNonHTTP, optionsIgnorePinned, optionsFormatCustom, optionsFilterTabs, optionsCustomHeader

var defaultPopupStates = {
  'states': {
    format: false,
    popupLimitWindow: false,
    popupExportHTMLNetscapeFormat: false
  }
}

browser.runtime.getPlatformInfo(function (info) {
  os = info.os
})

browser.windows.getLastFocused(function (currentWindow) {
  currentWindowId = currentWindow.id
})

w.addEventListener('load', function () {
  popupCounter = d.getElementsByClassName('popup-counter')[0]
  popupFilterTabs = d.getElementsByClassName('popup-filter-tabs')[0]
  popupFilterTabsContainer = d.getElementsByClassName('popup-filter-tabs-container')[0]
  popupTextarea = d.getElementsByClassName('popup-textarea')[0]
  popupTextareaContainer = d.getElementsByClassName('popup-textarea-container')[0]
  popupFormat = d.getElementById('popup-format')
  popupLabelFormatTitles = d.getElementsByClassName('popup-label-format-titles')[0]
  popupLabelFormatCustom = d.getElementsByClassName('popup-label-format-custom')[0]
  popupLimitWindow = d.getElementById('popup-limit-window')
  popupExportHTMLNetscapeFormat = d.getElementById('popup-export-html-netscape-format')
  popupCustomFileName = d.getElementById('popup-custom-file-name')
  popupButtonCopy = d.getElementsByClassName('popup-button-copy')[0]
  popupButtonExport = d.getElementsByClassName('popup-button-export')[0]
  popupButtonSettings = d.getElementsByClassName('popup-button-settings')[0]

  setLimitWindowVisibility()

  popupFormat.addEventListener('change', function () {
    savePopupStates()
    updatePopup()
  })

  popupButtonSettings.addEventListener('click', function () {
    browser.runtime.openOptionsPage()
  })

  popupLimitWindow.addEventListener('change', function () {
    savePopupStates()
    updatePopup()
  })

  popupExportHTMLNetscapeFormat.addEventListener('change', function () {
    savePopupStates()
    updatePopup()
  })

  popupFilterTabs.addEventListener('input', function () {
    updatePopup()
  })

  popupButtonCopy.addEventListener('click', function () {
    copyToClipboard()
  })

  popupButtonExport.addEventListener('click', function () {
    download()
  })

  getOptions()
  restorePopupStates()

  localization()
})

function updatePopup () {
  browser.tabs.query(
    {},
    function (tabs) {
      var list = ''
      var header = ''
      var format = '{url}\r\n'
      var actualNbTabs = 0
      var totalNbTabs = tabs.length
      var nbFilterMatch = 0
      var userInput = popupFilterTabs.value

      if (popupFormat.checked) format = '{title}\r\n{url}\r\n\r\n'

      if (optionsFormatCustom) {
        popupLabelFormatTitles.classList.add('hidden')
        popupLabelFormatCustom.classList.remove('hidden')

        if (popupFormat.checked) format = optionsFormatCustom.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
      }

      if (optionsFilterTabs) popupFilterTabsContainer.classList.remove('hidden')

      for (var i = 0; i < totalNbTabs; i++) {
        var tabWindowId = tabs[i].windowId
        var tabPinned = tabs[i].pinned
        var tabURL = tabs[i].url
        var tabTitle = tabs[i].title

        if (optionsIgnorePinned && tabPinned) continue
        if (popupLimitWindow.checked && tabWindowId !== currentWindowId) continue

        if ((optionsIgnoreNonHTTP && tabURL.startsWith('http')) || !optionsIgnoreNonHTTP) {
          actualNbTabs += 1

          if (filterMatch(userInput, [tabTitle, tabURL]) || userInput === '') {
            if (/<\/?[a-zA-Z]+\/?>/.test(format)) tabTitle = tabTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

            list += format.replace(/{title}/g, tabTitle).replace(/{url}/g, tabURL).replace(/{window-id}/g, tabWindowId)
          }
        }
      }

      popupTextarea.value = ''

      if (optionsCustomHeader) {
        var nbTabs = (userInput !== '') ? nbFilterMatch : actualNbTabs

        header = optionsCustomHeader.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/{num-tabs}/g, nbTabs)

        popupTextarea.value += header + '\r\n\r\n'
      }

      popupTextarea.value += list
      popupCounter.textContent = (userInput !== '') ? nbFilterMatch + ' / ' + actualNbTabs : actualNbTabs

      setSeparatorStyle()
      popupFilterTabs.focus()
    }
  )
}

function filterMatch (needle, haystack) {
  var regex = new RegExp(needle, 'i')
  var match = false

  haystack.forEach(function (element) {
    if (regex.test(element)) match = true
  })

  return match
}

function setSeparatorStyle () {
  if (hasScrollbar(popupTextarea)) {
    popupTextareaContainer.classList.add('has-scrollbar')
  } else {
    popupTextareaContainer.classList.remove('has-scrollbar')
  }
}

function setLimitWindowVisibility () {
  let getting = browser.windows.getAll()

  getting.then(function (windowInfoArray) {
    if (windowInfoArray.length > 1) {
      popupLimitWindow.parentNode.classList.remove('hidden')
    }
  })
}

function copyToClipboard () {
  if (popupButtonCopy.classList.contains('disabled')) return

  popupTextarea.select()

  var message = d.execCommand('copy') ? 'copiedToClipboard' : 'notCopiedToClipboard'

  browser.notifications.create('ExportTabsURLs', {
    'type': 'basic',
    'title': browser.i18n.getMessage('appName'),
    'iconUrl': '../img/icon.svg',
    'message': browser.i18n.getMessage(message)
  })

  popupButtonCopy.classList.add('disabled')

  setTimeout(function () {
    browser.notifications.clear('ExportTabsURLs')
    popupButtonCopy.classList.remove('disabled')
  }, 3000)
}

function generateFileName() {
  if (popupCustomFileName.value) {
    return popupCustomFileName.value;
  }
  if (optionsCustomHeader) {
    return header + '_ExportTabsURLs';
  }
  return moment().format('YYYYMMDDTHHmmssZZ') + '_ExportTabsURLs';
}

function indent(num) {
  var result = ''
  for (var i = 0; i < num; i++) {
    result += ' '
  }
  return result;
}

function downloadHTML() {
  browser.tabs.query(
    {},
    function (tabs) {
      var file = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n'
        + indent(4) + '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n'
        + indent(4) + '<TITLE>Export tabs URLs</TITLE>\n'
        + indent(4) + '<H1>Export tabs URLs</H1>\n'
        + indent(4) + '<DL><p>\n'
      var header = ''
      var actualNbTabs = 0
      var totalNbTabs = tabs.length
      var nbFilterMatch = 0
      var userInput = popupFilterTabs.value
      var idt = 6

      if (optionsFilterTabs) popupFilterTabsContainer.classList.remove('hidden')

      if (optionsCustomHeader) {
        var nbTabs = (userInput !== '') ? nbFilterMatch : actualNbTabs
        header = optionsCustomHeader.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/{num-tabs}/g, nbTabs)
        file += (indent(6) + '<DT><H3>' + header + '</H3>\n')
        file += (indent(6) + '<DL><p>\n')
        idt = 8
      }

      for (var i = 0; i < totalNbTabs; i++) {
        var tabWindowId = tabs[i].windowId
        var tabPinned = tabs[i].pinned
        var tabURL = tabs[i].url
        var tabTitle = tabs[i].title

        if (optionsIgnorePinned && tabPinned) continue
        if (popupLimitWindow.checked && tabWindowId !== currentWindowId) continue

        if ((optionsIgnoreNonHTTP && tabURL.startsWith('http')) || !optionsIgnoreNonHTTP) {
          actualNbTabs += 1

          if (filterMatch(userInput, [tabTitle, tabURL]) || userInput === '') {
            file += (indent(idt) + '<DT><A HREF="' + tabURL + '">' + tabTitle + '</A>\n')
          }
        }
      }

      if (optionsCustomHeader) {
        file += (indent(6) + '</DL><p>\n')
      }

      file += (indent(4) + '</DL><p>')

      var downloadElement = d.createElement('a')
      downloadElement.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(file)
      downloadElement.download = generateFileName() + '.html'
      downloadElement.style.display = 'none'
      d.body.appendChild(downloadElement)
      downloadElement.click()
      d.body.removeChild(downloadElement)
    }
  )
}

function download () {
  var list = popupTextarea.value

  // fix inconsistent behaviour on Windows, see https://github.com/alct/export-tabs-urls/issues/2
  if (os === 'win') list = list.replace(/\r?\n/g, '\r\n')

  if (popupExportHTMLNetscapeFormat.checked) {
    downloadHTML()
  } else {
    var element = d.createElement('a')
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(list)
    element.download = generateFileName() + '.txt'
    element.style.display = 'none'

    d.body.appendChild(element)
    element.click()
    d.body.removeChild(element)
  }
}

function restorePopupStates () {
  let gettingItem = browser.storage.local.get(defaultPopupStates)

  gettingItem.then(function (items) {
    popupLimitWindow.checked = items.states.popupLimitWindow
    popupFormat.checked = items.states.format
    popupExportHTMLNetscapeFormat.checked = items.states.popupExportHTMLNetscapeFormat

    updatePopup()
  })
}

function savePopupStates () {
  browser.storage.local.set({
    'states': {
      format: popupFormat.checked,
      popupLimitWindow: popupLimitWindow.checked,
      popupExportHTMLNetscapeFormat: popupExportHTMLNetscapeFormat.checked
    }
  })
}

function getOptions () {
  let gettingItem = browser.storage.local.get(defaultOptions)

  gettingItem.then(function (items) {
    optionsIgnoreNonHTTP = items.options.ignoreNonHTTP
    optionsIgnorePinned = items.options.ignorePinned
    optionsFormatCustom = items.options.formatCustom
    optionsFilterTabs = items.options.filterTabs
    optionsCustomHeader = items.options.customHeader
  })
}
