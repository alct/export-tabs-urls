export const defaultOptions = {
  options: {
    ignoreNonHTTP: true,
    ignorePinned: false,
    formatCustom: '',
    filterTabs: true,
    customHeader: '',
    groupBy: 'none'
  }
};

export function localization () {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const tag = node.tagName.toLowerCase();
    const translation = browser.i18n.getMessage(node.dataset.i18n);

    if (tag === 'input') {
      if (node.hasAttribute('placeholder')) {
        node.placeholder = translation;
      } else {
        node.value = translation;
      }
    } else if (node.dataset.i18nHtml !== undefined) {
      node.innerHTML = translation;
    } else {
      node.textContent = translation;
    }
  });
}

/**
 * Determine whether a vertical scrollbar is visible within an element.
 * @param  {Element} element
 * @return {boolean}
 */
export function hasScrollbar (element) {
  return element.scrollHeight > element.clientHeight;
}

export async function buildGroupMap () {
  const map = new Map();
  if (typeof browser.tabGroups === 'undefined') return map;

  const groups = await browser.tabGroups.query({});
  for (const g of groups) {
    map.set(g.id, g.title || `${g.color.charAt(0).toUpperCase()}${g.color.slice(1)} group`);
  }
  return map;
}
