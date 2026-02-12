import { defaultOptions, localization } from '/shared/shared.js';

async function init () {
  const optionsIgnoreNonHTTP = document.querySelector('#options-ignore-non-http');
  const optionsIgnorePinned = document.querySelector('#options-ignore-pinned');
  const optionsFormatCustom = document.querySelector('#options-format-custom');
  const optionsButtonResetFormat = document.querySelector('#options-button-reset-format');
  const optionsFilterTabs = document.querySelector('#options-filter-tabs');
  const optionsCustomHeader = document.querySelector('#options-custom-header');
  const optionsButtonResetHeader = document.querySelector('#options-button-reset-header');

  optionsIgnoreNonHTTP.addEventListener('change', saveOptions);
  optionsIgnorePinned.addEventListener('change', saveOptions);
  optionsFilterTabs.addEventListener('change', saveOptions);

  optionsButtonResetFormat.addEventListener('click', () => {
    optionsFormatCustom.value = '';
    saveOptions();
    updateResetVisibility();
  });

  optionsFormatCustom.addEventListener('input', () => {
    saveOptions();
    updateResetVisibility();
  });

  optionsButtonResetHeader.addEventListener('click', () => {
    optionsCustomHeader.value = '';
    saveOptions();
    updateResetVisibility();
  });

  optionsCustomHeader.addEventListener('input', () => {
    saveOptions();
    updateResetVisibility();
  });

  await restoreOptions();
  localization();

  function updateResetVisibility () {
    optionsButtonResetFormat.classList.toggle('hidden', optionsFormatCustom.value === '');
    optionsButtonResetHeader.classList.toggle('hidden', optionsCustomHeader.value === '');
  }

  async function restoreOptions () {
    const items = await browser.storage.local.get(defaultOptions);
    optionsIgnoreNonHTTP.checked = items.options.ignoreNonHTTP;
    optionsIgnorePinned.checked = items.options.ignorePinned;
    optionsFormatCustom.value = items.options.formatCustom;
    optionsFilterTabs.checked = items.options.filterTabs;
    optionsCustomHeader.value = items.options.customHeader;
    updateResetVisibility();
  }

  function saveOptions () {
    browser.storage.local.set({
      options: {
        ignoreNonHTTP: optionsIgnoreNonHTTP.checked,
        ignorePinned: optionsIgnorePinned.checked,
        formatCustom: optionsFormatCustom.value,
        filterTabs: optionsFilterTabs.checked,
        customHeader: optionsCustomHeader.value
      }
    });
  }
}

init();
