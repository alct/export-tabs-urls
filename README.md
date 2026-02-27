# Export Tabs URLs

[Export Tabs URLs](https://addons.mozilla.org/firefox/addon/export-tabs-urls-and-titles/) (ETU) is a Web browser extension that allows to list the URLs of all the open tabs and copy that list to clipboard or export it to a timestamped file.

This add-on started as a personal hobby project, a way to learn and scratch a simple itch. It has reached a point where I consider it feature-complete. I'll continue to fix bugs, and contributions are always appreciated, but there's no guarantee that feature requests, suggestions, or PRs will be acted upon. New features may come if inspiration strikes, but no promises.

For context on the deliberate lack of Chrome(ium) support, please [see my comment there](https://github.com/alct/export-tabs-urls/issues/14#issuecomment-498904695).

## Features

- **Include titles**: ETU provides a default format which displays titles along tabs URLs ;
- **Custom format**: optionally, custom patterns can be defined instead of the default "include titles" one (e.g. markdown) ;
- **Filter tabs**: ETU provides a RegExp-enabled tabs filter ;
- **Group tabs**: optionally, exported tabs can be organized into sections grouped by window, by tab group, or by both;
- **Limit to current window**: optionally, the list can be limited to the current window ;
- **List non-HTTP(s) URLs** : optionally, ETU can list each and every tab, including cases where the URL scheme isn't HTTP(s)

## Permissions

- **Access browser tabs** : required to list the tabs ;
- **Storage** : required to store settings.

## Screenshots

![screenshot-1](https://imgs.be/5cadf463-2668.png)
![screenshot-2](https://imgs.be/5cadf439-1411.png)
![screenshot-3](https://imgs.be/5cadf44d-1457.png)

## License

[GPLv3](LICENSE)
