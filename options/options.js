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
    setOptionsButtonResetFormatVisibility()
  })

  optionsFormatCustom.addEventListener('input', function () {
    saveOptions()
    setOptionsButtonResetFormatVisibility()
  })

  optionsFilterTabs.addEventListener('change', function () {
    saveOptions()
  })

  restoreOptions()
  localization()
})

function setOptionsButtonResetFormatVisibility () {
  if (optionsFormatCustom.value !== '') {
    optionsButtonResetFormat.classList.remove('hidden')
  } else {
    optionsButtonResetFormat.classList.add('hidden')
  }
}

function restoreOptions () {
  let gettingItem = browser.storage.local.get(defaultOptions)

  gettingItem.then(function (items) {
    optionsIgnoreNonHTTP.checked = items.options.ignoreNonHTTP
    optionsIgnorePinned.checked = items.options.ignorePinned
    optionsFormatCustom.value = items.options.formatCustom
    optionsFilterTabs.checked = items.options.filterTabs

    setOptionsButtonResetFormatVisibility()
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
