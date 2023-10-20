# Emoji
This is yet another emoji search website. See [GitHub Pages](https://ricmsd.github.io/emoji/).

## Features
- Emoji list/grid display
- Twitter Emoji (Twemoji) display support
- Group selection, emoji search, keyword search, 
- Copy emoji and code points to clipboard
- Light mode/dark mode switching
- Filtering by status (fully-qualified, minimally-qualified, etc.)
- Filtering by skin tone (light skin tone, dark skin tone, etc.)

## Screenshot
|List View|Grid View|
|---|---|
|![emoji](https://raw.githubusercontent.com/ricmsd/emoji/main/docs/screenshot-light-list.png)|![emoji](https://raw.githubusercontent.com/ricmsd/emoji/main/docs/screenshot-light-grid.png)|

## Development
If you want to try this website in a localhost, execute the following command.

    git clone https://github.com/ricmsd/emoji.git
    cd emoji
    npm install
    npm start

Then open http://localhost:4200 in your browser.

## Deployment
Currently, the site is built & deployed manually using [angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages).

## License
`src/assets/emoji.json` is a processed version of data from the following site. See `src/assets/licences.html` and ReadMe.txt at the following site for the licence of this data.
- https://unicode.org/Public/emoji/14.0/
