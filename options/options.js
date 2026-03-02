import { defaultOptions, localization } from '/shared/shared.js';

async function init () {
  const optionsIgnoreNonHTTP = document.querySelector('#options-ignore-non-http');
  const optionsIgnorePinned = document.querySelector('#options-ignore-pinned');
  const optionsFormatCustomTab = document.querySelector('#options-format-custom-tab');
  const optionsButtonResetTabFormat = document.querySelector('#options-button-reset-tab-format');
  const optionsFilterTabs = document.querySelector('#options-filter-tabs');
  const optionsCustomGlobalHeader = document.querySelector('#options-custom-global-header');
  const optionsButtonResetGlobalHeader = document.querySelector('#options-button-reset-global-header');
  const optionsGroupBy = document.querySelector('#options-group-by');
  const optionsCustomSectionHeader = document.querySelector('#options-custom-section-header');
  const optionsButtonResetSectionHeader = document.querySelector('#options-button-reset-section-header');
  const optionsSectionHeaderContainer = document.querySelector('.option-section-header');

  optionsIgnoreNonHTTP.addEventListener('change', saveOptions);
  optionsIgnorePinned.addEventListener('change', saveOptions);
  optionsFilterTabs.addEventListener('change', saveOptions);
  optionsGroupBy.addEventListener('change', () => {
    saveOptions();
    updateSectionHeaderVisibility();
  });

  optionsCustomSectionHeader.addEventListener('input', () => {
    saveOptions();
    updateResetVisibility();
  });

  optionsButtonResetSectionHeader.addEventListener('click', () => {
    optionsCustomSectionHeader.value = '';
    saveOptions();
    updateResetVisibility();
  });

  optionsButtonResetTabFormat.addEventListener('click', () => {
    optionsFormatCustomTab.value = '';
    saveOptions();
    updateResetVisibility();
  });

  optionsFormatCustomTab.addEventListener('input', () => {
    saveOptions();
    updateResetVisibility();
  });

  optionsButtonResetGlobalHeader.addEventListener('click', () => {
    optionsCustomGlobalHeader.value = '';
    saveOptions();
    updateResetVisibility();
  });

  optionsCustomGlobalHeader.addEventListener('input', () => {
    saveOptions();
    updateResetVisibility();
  });

  await restoreOptions();
  localization();

  function updateResetVisibility () {
    optionsButtonResetTabFormat.classList.toggle('hidden', optionsFormatCustomTab.value === '');
    optionsButtonResetGlobalHeader.classList.toggle('hidden', optionsCustomGlobalHeader.value === '');
    optionsButtonResetSectionHeader.classList.toggle('hidden', optionsCustomSectionHeader.value === '');
  }

  function updateSectionHeaderVisibility () {
    optionsSectionHeaderContainer.classList.toggle('hidden', optionsGroupBy.value === 'none' || optionsGroupBy.value === '');
  }

  async function restoreOptions () {
    const items = await browser.storage.local.get(defaultOptions);
    optionsIgnoreNonHTTP.checked = items.options.ignoreNonHTTP;
    optionsIgnorePinned.checked = items.options.ignorePinned;
    optionsFormatCustomTab.value = items.options.formatCustom;
    optionsFilterTabs.checked = items.options.filterTabs;
    optionsCustomGlobalHeader.value = items.options.customHeader;
    optionsGroupBy.value = items.options.groupBy || 'none';
    optionsCustomSectionHeader.value = items.options.customSectionHeader;
    updateResetVisibility();
    updateSectionHeaderVisibility();
  }

  function saveOptions () {
    browser.storage.local.set({
      options: {
        ignoreNonHTTP: optionsIgnoreNonHTTP.checked,
        ignorePinned: optionsIgnorePinned.checked,
        formatCustom: optionsFormatCustomTab.value,
        filterTabs: optionsFilterTabs.checked,
        customHeader: optionsCustomGlobalHeader.value,
        groupBy: optionsGroupBy.value,
        customSectionHeader: optionsCustomSectionHeader.value
      }
    });
  }
}

init();
