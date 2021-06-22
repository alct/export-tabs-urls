# Export Tabs URLs

[Export Tabs URLs](https://addons.mozilla.org/en-US/firefox/addon/export-tabs-urls-and-titles/) (ETU) is a Web browser extension that allows to list the URLs of all the open tabs and copy that list to clipboard or export it to a timestamped file.

Consider this add-on done (except for bugfixes). I may or may not add new features depending on the fun (or lack of it).

## Features

- **Include titles** : ETU provides a default format which displays titles along tabs URLs ;
- **Custom format** : optionally, custom patterns can be defined instead of the default "include titles" one (e.g. markdown) ;
- **Filter tabs** : ETU provides a RegExp-enabled tabs filter ;
- **Limit to current window** : optionally, the list can be limited to the current window ;
- **List non-HTTP(s) URLs** : optionally, ETU can list each and every tab, including cases where the URL scheme isn't HTTP(s) ;
- **Track containers** : optionally, prepend information about the container of every tab in [Open external links in a container](https://addons.mozilla.org/en-US/firefox/addon/open-url-in-container/) extension format

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
