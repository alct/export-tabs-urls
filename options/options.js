var optionsFormatCustom, optionsIgnoreNonHTTP, optionsButtonResetFormat

w.addEventListener('load', function () {
  optionsIgnoreNonHTTP = d.getElementById('options-ignore-non-http')
  optionsFormatCustom = d.getElementById('options-format-custom')
  optionsButtonResetFormat = d.getElementById('options-button-reset-format')

  optionsIgnoreNonHTTP.addEventListener('change', function () {
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
      formatCustom: ''
    }
  })

  gettingItem.then(function (items) {
    optionsIgnoreNonHTTP.checked = items.options.ignoreNonHTTP
    optionsFormatCustom.value = items.options.formatCustom

    toggleOptionsButtonResetFormat()
  })
}

function saveOptions () {
  browser.storage.local.set({
    'options': {
      ignoreNonHTTP: optionsIgnoreNonHTTP.checked,
      formatCustom: optionsFormatCustom.value
    }
  })
}
