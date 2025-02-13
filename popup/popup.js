var
popupButtonSettings, popupCounter, popupTextarea, popupTextareaContainer, popupFilterTabs, popupFilterTabsContainer,
popupButtonCopy, popupButtonExport,
popupFormat, popupLabelFormatTitles, popupLabelFormatCustom, popupLimitWindow,
currentWindowId, os,
optionsIgnoreNonHTTP, optionsIgnorePinned, optionsFormatCustom, optionsFilterTabs, optionsCustomHeader, optionsTrackContainer, optionsContainerBlacklist

var defaultPopupStates = {
  'states': {
    format: true,
    popupLimitWindow: false
  }
}

browser.runtime.getPlatformInfo(function (info) {
  os = info.os
  if (os === 'android') {
    // Hide window-related UI elements on Android
    if (popupLimitWindow) {
      popupLimitWindow.closest('p').classList.add('hidden');
    }
  } else {
    // Only get window info on non-Android platforms
    browser.windows.getLastFocused(function (currentWindow) {
      currentWindowId = currentWindow.id
    })
  }
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
  popupButtonCopy = d.getElementsByClassName('popup-button-copy')[0]
  popupButtonExport = d.getElementsByClassName('popup-button-export')[0]
  popupButtonSettings = d.getElementsByClassName('popup-button-settings')[0]

  // Add popup-page class for Android-specific styling
  d.body.classList.add('popup-page');
  
  // Check platform and setup Android UI if needed
  checkPlatform();

  popupFormat.addEventListener('change', function () {
    savePopupStates()
    updatePopup()
  })

  popupButtonSettings.addEventListener('click', function () {
    if (os === 'android') {
      // On Android, open options page directly
      browser.tabs.create({
        url: browser.runtime.getURL("options/options.html")
      });
      window.close(); // Close the popup
    } else {
      // On desktop, use the standard method
      browser.runtime.openOptionsPage();
    }
  })

  popupLimitWindow.addEventListener('change', function () {
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

async function updatePopup () {
  var containers = await browser.contextualIdentities.query({});
  var list = ''
  var header = ''
  var format = '{url}\r\n'
  var actualNbTabs = 0
  var nbFilterMatch = 0
  var userInput = popupFilterTabs.value
  var jsonStr = "[" + optionsContainerBlacklist + "]"
  var containerBlacklist = JSON.parse(jsonStr)
  containerBlacklist = containerBlacklist.filter(function(item) { return item !== ""})

  if (popupFormat.checked) format = '{title}\r\n{url}\r\n\r\n'

  if (optionsFormatCustom) {
    popupLabelFormatTitles.classList.add('hidden')
    popupLabelFormatCustom.classList.remove('hidden')

    if (popupFormat.checked) format = optionsFormatCustom.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
  }

  if (optionsFilterTabs) popupFilterTabsContainer.classList.remove('hidden')

  // Different tab querying logic for Android vs desktop
  let tabs;
  if (os === 'android') {
    // On Android, just get all tabs since there's no window concept
    tabs = await browser.tabs.query({});
    list = processTabList(tabs, containers, containerBlacklist, format, userInput);
  } else {
    // On desktop, handle windows
    const windows = await browser.windows.getAll();
    for (var window of windows) {
      if (popupLimitWindow.checked && window.id !== currentWindowId) continue
      tabs = await browser.tabs.query({ windowId: window.id });
      list += processTabList(tabs, containers, containerBlacklist, format, userInput) + "\r\n\r\n";
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


// Helper function to process a list of tabs
function processTabList(tabs, containers, containerBlacklist, format, userInput) {
  let list = '';
  for (var tab of tabs) {
    var containerPrefix = "";
    var containerName = "";
    var containerTitle = "";
    if (optionsTrackContainer) {
      var container = containers.find((container) => container.cookieStoreId == tab.cookieStoreId)
      if (container !== undefined) {
        var blacklistMatch = containerBlacklist.find(containerReg => container.name.match(RegExp(containerReg)))
        if(!blacklistMatch){
          containerPrefix = "ext+container:name=" + container.name + "&url="
          containerName = container.name
          containerTitle = container.name + ": "
        }}}

    var tabPinned = tab.pinned
    var tabURL = tab.url
    var tabTitle = tab.title

    if (optionsIgnorePinned && tabPinned) continue

    if ((optionsIgnoreNonHTTP && tabURL.startsWith('http')) || !optionsIgnoreNonHTTP || (optionsTrackContainer && tabURL.startsWith('ext'))) {
      actualNbTabs += 1

      if (filterMatch(userInput, [tabTitle, tabURL]) || userInput === '') {
        nbFilterMatch += 1

        if (/<\/?[a-zA-Z]+\/?>/.test(format)) tabTitle = tabTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

        list += format.replace(/{title}/g, tabTitle)
                     .replace(/{url}/g, tabURL)
                     .replace(/{window-id}/g, tab.windowId || '')
                     .replace(/{container-name}/g, containerName)
                     .replace(/{container-url}/g, containerPrefix)
                     .replace(/{container-title}/g, containerTitle);
      }
    }
  }
  return list;
}
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

function download () {
  var list = popupTextarea.value

  // fix inconsistent behaviour on Windows, see https://github.com/alct/export-tabs-urls/issues/2
  if (os === 'win') list = list.replace(/\r?\n/g, '\r\n')

  var element = d.createElement('a')
  element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(list)
  element.download = moment().format('YYYYMMDDTHHmmssZZ') + '_ExportTabsURLs.txt'
  element.style.display = 'none'

  d.body.appendChild(element)
  element.click()
  d.body.removeChild(element)
}

function restorePopupStates () {
  let gettingItem = browser.storage.local.get(defaultPopupStates)

  gettingItem.then(function (items) {
    popupLimitWindow.checked = items.states.popupLimitWindow
    popupFormat.checked = items.states.format

    updatePopup()
  })
}

function savePopupStates () {
  browser.storage.local.set({
    'states': {
      format: popupFormat.checked,
      popupLimitWindow: popupLimitWindow.checked
    }
  })
}

function getOptions () {
  let gettingItem = browser.storage.local.get(defaultOptions)

  gettingItem.then(function (items) {
    optionsIgnoreNonHTTP = items.options.ignoreNonHTTP
    optionsTrackContainer = items.options.trackContainer
    optionsContainerBlacklist = items.options.containerBlacklist
    optionsIgnorePinned = items.options.ignorePinned
    optionsFormatCustom = items.options.formatCustom
    optionsFilterTabs = items.options.filterTabs
    optionsCustomHeader = items.options.customHeader
  })
}

function checkPlatform() {
  if (os === 'android') {
    // Add Android-specific styling and setup
  }
  else {
    setLimitWindowVisibility()
  }
}
