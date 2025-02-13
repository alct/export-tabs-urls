var d = document
var w = window
var isAndroid = false

var defaultOptions = {
  'options': {
    trackContainer: true,
    ignoreNonHTTP: true,
    ignorePinned: false,
    formatCustom: "{container-url}{url}\r\n",
    filterTabs: true,
    customHeader: '', 
    containerBlacklist: ''
  }
}

// Check if running on Android
async function checkPlatform() {
  const info = await browser.runtime.getPlatformInfo();
  isAndroid = info.os === 'android';
  if (isAndroid) {
    setupAndroidUI();
  }
}

// Adjust UI for Android
function setupAndroidUI() {
  // Add Android-specific CSS class to body
  d.body.classList.add('android-device');
  
  // Adjust popup size for Android
  if (d.body.classList.contains('popup-page')) {
    const viewport = d.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1';
    } else {
      const meta = d.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
      d.head.appendChild(meta);
    }
  }
}

function localization () {
  d.querySelectorAll('[data-i18n]').forEach(function (node) {
    var tag = node.tagName.toLowerCase()
    var translation = browser.i18n.getMessage(node.dataset.i18n)

    if (tag === 'input') {
      if (node.hasAttribute('placeholder')) {
        node.placeholder = translation
      } else {
        node.value = translation
      }
    } else {
      // Create a temporary container and parse the HTML safely
      const parser = new DOMParser();
      const doc = parser.parseFromString(translation, 'text/html');
      // Clear existing content
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
      // Append all parsed nodes
      Array.from(doc.body.childNodes).forEach(child => {
        node.appendChild(child.cloneNode(true));
      });
    }
  })
}

/**
 * Determine whether a vertical scrollbar is visible within an element
 * @param  {Object} element
 * @return {Boolean}
 */
function hasScrollbar (element) {
  return element.scrollHeight > element.clientHeight
}
