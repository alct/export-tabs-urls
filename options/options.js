var optionsFormatCustom, optionsIgnoreNonHTTP, optionsIgnorePinned, optionsButtonResetFormat, optionsFilterTabs

w.addEventListener('load', function () {
  optionsIgnoreNonHTTP = d.getElementById('options-ignore-non-http')
  optionsIgnorePinned = d.getElementById('options-ignore-pinned')
  optionsFormatCustom = d.getElementById('options-format-custom')
  optionsButtonResetFormat = d.getElementById('options-button-reset-format')
  optionsFilterTabs = d.getElementById('options-filter-tabs')

  optionsIgnoreNonHTTP.addEventListener('change', function () {
    saveOptions()
  })

  optionsIgnorePinned.addEventListener('change', function () {
    saveOptions()
  })

  optionsButtonResetFormat.addEventListener('click', function () {
    optionsFormatCustom.value = ''
    saveOptions()
    toggleOptionsButtonResetFormat()
  })

  optionsFormatCustom.addEventListener('input', function () {
    saveOptions()
    toggleOptionsButtonResetFormat()
  })

  optionsFilterTabs.addEventListener('change', function () {
    saveOptions()
  })

  restoreOptions()
  localization()
})

function toggleOptionsButtonResetFormat () {
  if (optionsFormatCustom.value !== '') {
    optionsButtonResetFormat.classList.remove('hidden')
  } else {
    optionsButtonResetFormat.classList.add('hidden')
  }
}

function restoreOptions () {
  let gettingItem = browser.storage.local.get({
    'options': {
      ignoreNonHTTP: true,
      ignorePinned: false,
      formatCustom: '',
      filterTabs: true
    }
  })

  gettingItem.then(function (items) {
    optionsIgnoreNonHTTP.checked = items.options.ignoreNonHTTP
    optionsIgnorePinned.checked = items.options.ignorePinned
    optionsFormatCustom.value = items.options.formatCustom
    optionsFilterTabs.checked = items.options.filterTabs

    toggleOptionsButtonResetFormat()
  })
}

function saveOptions () {
  browser.storage.local.set({
    'options': {
      ignoreNonHTTP: optionsIgnoreNonHTTP.checked,
      ignorePinned: optionsIgnorePinned.checked,
      formatCustom: optionsFormatCustom.value,
      filterTabs: optionsFilterTabs.checked
    }
  })
}
