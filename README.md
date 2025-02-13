# Export Tabs URLs (containers)

This is a clone of  [Export Tabs URLs](https://addons.mozilla.org/en-US/firefox/addon/export-tabs-urls-and-titles/) with support for firefox containers and multiple windows. PRs to merge to the parent project are pending but I wouldn't hold my breath.

The defaults are geared towards support for firefox containers.

I recommend the following custom format for firefox container.
- markdown 
  - [{container-title}{title}]({container-url}{url})\r\n
- org-mode
  - [[{container-url}{url}][{container-title}{title}]]\r\n


Consider this add-on done (except for bugfixes). I may or may not add new features depending on the fun (or lack of it).

# Features

- **Track containers** _(what this extension provides over the orignal)_: optionally, prepend information about the container of every tab in [Open external links in a container](https://addons.mozilla.org/en-US/firefox/addon/open-url-in-container/) extension format
- **Blacklist** _(what this extension provides over the orignal)_: optionally, blacklist certain containers from being displayed.
- **Windows** _(what this extension provides over the orignal)_: display tabs with newlines between tabs from subsequent windows for visual segementaton of windows. 
- **Include titles** : ETU provides a default format which displays titles along tabs URLs ;
- **Custom format** : optionally, custom patterns can be defined instead of the default "include titles" one (e.g. markdown) ;
- **Filter tabs** : ETU provides a RegExp-enabled tabs filter ;
- **Limit to current window** : optionally, the list can be limited to the current window ;
- **List non-HTTP(s) URLs** : optionally, ETU can list each and every tab, including cases where the URL scheme isn't HTTP(s) ;

## Permissions

- **Access browser tabs** : required to list the tabs ;
- **Input data to the clipboard** : required to copy the list to the clipboard ;
- **Display notifications** : not required stricto sensu (as the extension could work without it) but it is used to improve the user experience by providing visual feedback about what is going on ;
- **Storage** : required to store settings.

## Screenshots

![screenshot-1](https://imgs.be/5cadf463-2668.png)
![screenshot-2](https://imgs.be/5cadf439-1411.png)
![screenshot-3](https://imgs.be/5cadf44d-1457.png)

## License

[GPLv3](LICENSE)
