import { defaultOptions, localization, hasScrollbar } from '/shared/shared.js';

const defaultPopupStates = {
  states: {
    format: false,
    popupLimitWindow: false
  }
};

let currentWindowId;
let os;
let optionsIgnoreNonHTTP;
let optionsIgnorePinned;
let optionsFormatCustom;
let optionsFilterTabs;
let optionsCustomHeader;

async function init () {
  const [platformInfo, currentWindow] = await Promise.all([
    browser.runtime.getPlatformInfo(),
    browser.windows.getLastFocused()
  ]);

  os = platformInfo.os;
  currentWindowId = currentWindow.id;

  const popupCounter = document.querySelector('.popup-counter');
  const popupFilterTabs = document.querySelector('.popup-filter-tabs');
  const popupFilterTabsContainer = document.querySelector('.popup-filter-tabs-container');
  const popupTextarea = document.querySelector('.popup-textarea');
  const popupTextareaContainer = document.querySelector('.popup-textarea-container');
  const popupFormat = document.querySelector('#popup-format');
  const popupLabelFormatTitles = document.querySelector('.popup-label-format-titles');
  const popupLabelFormatCustom = document.querySelector('.popup-label-format-custom');
  const popupLimitWindow = document.querySelector('#popup-limit-window');
  const popupButtonCopy = document.querySelector('.popup-button-copy');
  const popupButtonExport = document.querySelector('.popup-button-export');
  const popupButtonSettings = document.querySelector('.popup-button-settings');

  await loadOptions();
  await restorePopupStates();
  setLimitWindowVisibility();

  popupFormat.addEventListener('change', () => {
    savePopupStates();
    updatePopup();
  });

  popupButtonSettings.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
  });

  popupLimitWindow.addEventListener('change', () => {
    savePopupStates();
    updatePopup();
  });

  popupFilterTabs.addEventListener('input', updatePopup);
  popupButtonCopy.addEventListener('click', copyToClipboard);
  popupButtonExport.addEventListener('click', download);

  localization();

  async function updatePopup () {
    const tabs = await browser.tabs.query({});

    let list = '';
    let header = '';
    let format = '{url}\r\n';
    let actualNbTabs = 0;
    let nbFilterMatch = 0;
    const totalNbTabs = tabs.length;
    const userInput = popupFilterTabs.value;

    if (popupFormat.checked) {
      format = '{title}\r\n{url}\r\n\r\n';
    }

    if (optionsFormatCustom) {
      popupLabelFormatTitles.classList.add('hidden');
      popupLabelFormatCustom.classList.remove('hidden');

      if (popupFormat.checked) {
        format = optionsFormatCustom.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      }
    }

    popupFilterTabsContainer.classList.toggle('hidden', !optionsFilterTabs);

    const formatContainsHtml = /<\/?[a-zA-Z]+\/?>/.test(format);

    for (let i = 0; i < totalNbTabs; i++) {
      const { windowId: tabWindowId, pinned: tabPinned, url: tabURL, title: tabTitle } = tabs[i];

      if (optionsIgnorePinned && tabPinned) continue;
      if (popupLimitWindow.checked && tabWindowId !== currentWindowId) continue;

      if ((optionsIgnoreNonHTTP && tabURL.startsWith('http')) || !optionsIgnoreNonHTTP) {
        actualNbTabs += 1;

        if (userInput === '' || filterMatch(userInput, [tabTitle, tabURL])) {
          nbFilterMatch += 1;

          let safeTitle = tabTitle;
          if (formatContainsHtml) {
            safeTitle = tabTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          }

          list += format
            .replace(/{title}/g, safeTitle)
            .replace(/{url}/g, tabURL)
            .replace(/{window-id}/g, tabWindowId);
        }
      }
    }

    popupTextarea.value = '';

    if (optionsCustomHeader) {
      const nbTabs = (userInput !== '') ? nbFilterMatch : actualNbTabs;

      header = optionsCustomHeader
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/{num-tabs}/g, nbTabs);

      popupTextarea.value += header + '\r\n\r\n';
    }

    popupTextarea.value += list;
    popupCounter.textContent = (userInput !== '') ? `${nbFilterMatch} / ${actualNbTabs}` : String(actualNbTabs);

    popupTextareaContainer.classList.toggle('has-scrollbar', hasScrollbar(popupTextarea));
    popupFilterTabs.focus();
  }

  function filterMatch (needle, haystack) {
    try {
      const regex = new RegExp(needle, 'i');
      return haystack.some((element) => regex.test(element));
    } catch {
      return haystack.some((element) => element.toLowerCase().includes(needle.toLowerCase()));
    }
  }

  async function setLimitWindowVisibility () {
    const windows = await browser.windows.getAll();
    if (windows.length > 1) {
      popupLimitWindow.parentNode.classList.remove('hidden');
    }
  }

  async function copyToClipboard () {
    if (popupButtonCopy.classList.contains('disabled')) return;

    let messageKey;
    try {
      await navigator.clipboard.writeText(popupTextarea.value);
      messageKey = 'copiedToClipboard';
    } catch {
      messageKey = 'notCopiedToClipboard';
    }

    browser.notifications.create('ExportTabsURLs', {
      type: 'basic',
      title: browser.i18n.getMessage('appName'),
      iconUrl: '../img/icon.svg',
      message: browser.i18n.getMessage(messageKey)
    });

    popupButtonCopy.classList.add('disabled');

    setTimeout(() => {
      browser.notifications.clear('ExportTabsURLs');
      popupButtonCopy.classList.remove('disabled');
    }, 3000);
  }

  function download () {
    let list = popupTextarea.value;

    // fix inconsistent behaviour on Windows, see https://github.com/alct/export-tabs-urls/issues/2
    if (os === 'win') {
      list = list.replace(/\r?\n/g, '\r\n');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = new Blob([list], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.href = url;
    element.download = `${timestamp}_ExportTabsURLs.txt`;
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    URL.revokeObjectURL(url);
  }

  async function restorePopupStates () {
    const items = await browser.storage.local.get(defaultPopupStates);
    popupLimitWindow.checked = items.states.popupLimitWindow;
    popupFormat.checked = items.states.format;
    updatePopup();
  }

  function savePopupStates () {
    browser.storage.local.set({
      states: {
        format: popupFormat.checked,
        popupLimitWindow: popupLimitWindow.checked
      }
    });
  }

  async function loadOptions () {
    const items = await browser.storage.local.get(defaultOptions);
    optionsIgnoreNonHTTP = items.options.ignoreNonHTTP;
    optionsIgnorePinned = items.options.ignorePinned;
    optionsFormatCustom = items.options.formatCustom;
    optionsFilterTabs = items.options.filterTabs;
    optionsCustomHeader = items.options.customHeader;
  }
}

init();
