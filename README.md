# flutter-media-session-guide

Interactive usage guide and documentation for [`flutter_media_session`](https://github.com/wyrindev/flutter-media-session).

Site: https://docs.wyrin.dev/flutter-media-session/

## Structure

```
.
├── build.js              # Site builder
├── template.html         # HTML template
├── content/              # Documentation source
│   ├── installation.md
│   ├── platforms/
│   ├── adapters/
│   └── features/
└── doc/img/screenshot/   # Screenshots
```

## Development

```bash
# Install dependencies
npm install

# Build static site to dist/
npm run build

# Preview locally
npx serve dist
```

## License

- Documentation: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Code snippets: [MIT](https://opensource.org/licenses/MIT)
