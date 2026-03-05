import { defaultOptions, localization, hasScrollbar, buildGroupMap } from '/shared/shared.js';

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
let optionsFormatCustomTab;
let optionsFilterTabs;
let optionsCustomGlobalHeader;
let optionsGroupBy;
let optionsCustomSectionHeader;
let optionsCustomFilename;
let groupMap;

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
  const popupLabelFormatCustomTab = document.querySelector('.popup-label-format-custom-tab');
  const popupLimitWindow = document.querySelector('#popup-limit-window');
  const popupButtonCopy = document.querySelector('.popup-button-copy');
  const popupButtonExport = document.querySelector('.popup-button-export');
  const popupButtonSettings = document.querySelector('.popup-button-settings');
  const popupNotification = document.querySelector('.popup-notification');

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

  let lastExportedCount = 0;

  async function updatePopup () {
    const [tabs, latestGroupMap] = await Promise.all([
      browser.tabs.query({}),
      buildGroupMap()
    ]);
    groupMap = latestGroupMap;

    let header = '';
    let format = '{url}\r\n';
    let actualNbTabs = 0;
    let nbFilterMatch = 0;
    const totalNbTabs = tabs.length;
    const userInput = popupFilterTabs.value;

    if (popupFormat.checked) {
      format = '{title}\r\n{url}\r\n\r\n';
    }

    if (optionsFormatCustomTab) {
      popupLabelFormatTitles.classList.add('hidden');
      popupLabelFormatCustomTab.classList.remove('hidden');

      if (popupFormat.checked) {
        format = optionsFormatCustomTab.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      }
    }

    popupFilterTabsContainer.classList.toggle('hidden', !optionsFilterTabs);

    const formatContainsHtml = /<\/?[a-zA-Z]+\/?>/.test(format);

    const filtered = [];

    for (let i = 0; i < totalNbTabs; i++) {
      const { windowId: tabWindowId, pinned: tabPinned, url: tabURL, title: tabTitle, groupId: tabGroupId } = tabs[i];

      if (optionsIgnorePinned && tabPinned) continue;
      if (popupLimitWindow.checked && tabWindowId !== currentWindowId) continue;

      if ((optionsIgnoreNonHTTP && tabURL.startsWith('http')) || !optionsIgnoreNonHTTP) {
        actualNbTabs += 1;

        if (userInput === '' || filterMatch(userInput, [tabTitle, tabURL])) {
          nbFilterMatch += 1;
          filtered.push({
            tabTitle,
            tabURL,
            tabWindowId,
            tabGroupId: tabGroupId ?? -1,
            tabGroupName: groupMap.get(tabGroupId) || 'Ungrouped'
          });
        }
      }
    }

    let list = '';

    if (optionsGroupBy === 'none') {
      list = buildFlatList(filtered, format, formatContainsHtml);
    } else {
      list = buildGroupedList(filtered, format, formatContainsHtml, optionsGroupBy, optionsCustomSectionHeader);
    }

    popupTextarea.value = '';

    if (optionsCustomGlobalHeader) {
      const nbTabs = (userInput !== '') ? nbFilterMatch : actualNbTabs;
      const ts = getTimestampParts();

      header = optionsCustomGlobalHeader
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/{num-tabs}/g, nbTabs)
        .replace(/{date}/g, ts.date)
        .replace(/{time}/g, ts.time)
        .replace(/{utc-offset}/g, ts.utcOffset);

      popupTextarea.value += header + '\r\n';
    }

    popupTextarea.value += list;
    popupCounter.textContent = (userInput !== '') ? `${nbFilterMatch} / ${actualNbTabs}` : String(actualNbTabs);
    lastExportedCount = (userInput !== '') ? nbFilterMatch : actualNbTabs;

    popupTextareaContainer.classList.toggle('has-scrollbar', hasScrollbar(popupTextarea));
    popupFilterTabs.focus();
  }

  function formatTab (tab, format, formatContainsHtml) {
    let safeTitle = tab.tabTitle;
    if (formatContainsHtml) {
      safeTitle = safeTitle
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    return format
      .replace(/{title}/g, safeTitle)
      .replace(/{url}/g, tab.tabURL)
      .replace(/{window-id}/g, tab.tabWindowId)
      .replace(/{tab-group}/g, tab.tabGroupName);
  }

  function buildFlatList (tabs, format, formatContainsHtml) {
    let list = '';
    for (const tab of tabs) {
      list += formatTab(tab, format, formatContainsHtml);
    }
    return list;
  }

  function buildGroupedList (tabs, format, formatContainsHtml, groupBy, customSectionHeader) {
    const sections = new Map();

    for (const tab of tabs) {
      let key, label, windowId, groupName;

      if (groupBy === 'window') {
        key = `w-${tab.tabWindowId}`;
        label = `Window ${tab.tabWindowId}`;
        windowId = String(tab.tabWindowId);
        groupName = '';
      } else if (groupBy === 'tab-group') {
        windowId = '';
        if (tab.tabGroupId === -1) {
          key = 'g-none';
          label = 'Ungrouped';
          groupName = 'Ungrouped';
        } else {
          key = `g-${tab.tabGroupId}`;
          label = tab.tabGroupName || `Group ${tab.tabGroupId}`;
          groupName = tab.tabGroupName || `Group ${tab.tabGroupId}`;
        }
      } else if (groupBy === 'both') {
        windowId = String(tab.tabWindowId);
        if (tab.tabGroupId === -1) {
          key = `w-${tab.tabWindowId}-g-none`;
          label = `Window ${tab.tabWindowId} \u203A Ungrouped`;
          groupName = 'Ungrouped';
        } else {
          const gName = tab.tabGroupName || `Group ${tab.tabGroupId}`;
          key = `w-${tab.tabWindowId}-g-${tab.tabGroupId}`;
          label = `Window ${tab.tabWindowId} \u203A ${gName}`;
          groupName = gName;
        }
      }

      if (!sections.has(key)) {
        sections.set(key, { label, windowId, groupName, tabs: [] });
      }
      sections.get(key).tabs.push(tab);
    }

    let list = '';
    let isFirst = true;

    for (const [, section] of sections) {
      if (!isFirst) list += '\r\n';

      if (customSectionHeader) {
        list += customSectionHeader
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/{window-id}/g, section.windowId)
          .replace(/{tab-group}/g, section.groupName);
        list += '\r\n';
      } else {
        list += `## ${section.label}\r\n\r\n`;
      }

      for (const tab of section.tabs) {
        list += formatTab(tab, format, formatContainsHtml);
      }
      isFirst = false;
    }

    return list;
  }

  function getTimestampParts () {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);
    const utcOffset = `${sign}${offsetHours}:${offsetMinutes}`;

    const compact = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${sign}${offsetHours}${offsetMinutes}`;

    return { date, time, utcOffset, compact };
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
    let isError = false;
    try {
      await navigator.clipboard.writeText(popupTextarea.value);
      messageKey = 'copiedToClipboard';
    } catch {
      messageKey = 'notCopiedToClipboard';
      isError = true;
    }

    popupNotification.textContent = browser.i18n.getMessage(messageKey);
    popupNotification.classList.toggle('error', isError);
    popupNotification.classList.add('visible');

    popupButtonCopy.classList.add('disabled');

    setTimeout(() => {
      popupNotification.classList.remove('visible');
      popupButtonCopy.classList.remove('disabled');
    }, 3000);
  }

  function buildFilename () {
    const ts = getTimestampParts();
    const defaultName = `${ts.compact}_ExportTabsURLs.txt`;

    if (!optionsCustomFilename) {
      return defaultName;
    }

    let name = optionsCustomFilename
      .replace(/{timestamp}/g, ts.compact)
      .replace(/{date}/g, ts.date)
      .replace(/{time}/g, ts.time.replace(/:/g, '-'))
      .replace(/{utc-offset}/g, ts.utcOffset.replace(/:/g, '-'))
      .replace(/{num-tabs}/g, lastExportedCount);

    name = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-');

    return name.trim() || defaultName;
  }

  function download () {
    let list = popupTextarea.value;

    // fix inconsistent behaviour on Windows, see https://github.com/alct/export-tabs-urls/issues/2
    if (os === 'win') {
      list = list.replace(/\r?\n/g, '\r\n');
    }

    const blob = new Blob([list], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.href = url;
    element.download = buildFilename();
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
    optionsFormatCustomTab = items.options.formatCustom;
    optionsFilterTabs = items.options.filterTabs;
    optionsCustomGlobalHeader = items.options.customHeader;
    optionsGroupBy = items.options.groupBy || 'none';
    optionsCustomSectionHeader = items.options.customSectionHeader;
    optionsCustomFilename = items.options.customFilename;
  }
}

init();
