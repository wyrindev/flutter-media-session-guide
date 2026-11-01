import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base domain for SEO canonical URLs & sitemap
const SITE_BASE_URL = 'https://docs.wyrin.dev';

// Configure marked with custom code block renderer that adds code wrapper & copy button
const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.getLanguage(language)
    ? hljs.highlight(text, { language }).value
    : text;

  const displayLang = language.toUpperCase();

  return `
<div class="code-wrapper">
  <div class="code-header">
    <span>${displayLang}</span>
    <button class="copy-btn" onclick="copyCode(this)" aria-label="Copy code snippet">
      <svg class="icon" style="width:14px;height:14px;" aria-hidden="true"><use href="#icon-content_copy"></use></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre><code class="hljs language-${language}">${highlighted}</code></pre>
</div>`;
};

// Render inline code backticks with semantic styling
renderer.codespan = function ({ text }) {
  return `<code class="inline-code">${text}</code>`;
};

// Render blockquotes and parse GitHub-style alerts like > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
renderer.blockquote = function ({ tokens }) {
  const parsedContent = this.parser.parse(tokens);

  const alertMatch = parsedContent.match(/^\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?([\s\S]*?)<\/p>([\s\S]*)$/i);

  if (alertMatch) {
    const type = alertMatch[1].toLowerCase();
    const firstLine = alertMatch[2].trim();
    const rest = alertMatch[3];

    let iconId = 'icon-info';
    let title = 'Note';

    if (type === 'tip') {
      iconId = 'icon-lightbulb';
      title = 'Tip';
    } else if (type === 'warning' || type === 'caution') {
      iconId = 'icon-warning';
      title = type === 'caution' ? 'Caution' : 'Warning';
    } else if (type === 'important') {
      iconId = 'icon-info';
      title = 'Important';
    }

    return `
<div class="markdown-callout markdown-callout-${type}" role="region" aria-label="${title}">
  <svg class="icon callout-icon" aria-hidden="true"><use href="#${iconId}"></use></svg>
  <div class="callout-content">
    <div class="callout-title">${title}</div>
    ${firstLine ? `<p>${firstLine}</p>` : ''}
    ${rest}
  </div>
</div>`;
  }

  return `<blockquote>\n${parsedContent}\n</blockquote>`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
});

// Map placeholder keys to content markdown file paths
const contentMapping = {
  // Step 1: Installation
  '{{CONTENT_INSTALLATION}}': 'content/installation.md',

  // Step 2: Platforms
  '{{CONTENT_PLATFORM_ANDROID}}': 'content/platforms/android.md',
  '{{CONTENT_PLATFORM_IOS}}': 'content/platforms/ios.md',
  '{{CONTENT_PLATFORM_MACOS}}': 'content/platforms/macos.md',
  '{{CONTENT_PLATFORM_WINDOWS}}': 'content/platforms/windows.md',
  '{{CONTENT_PLATFORM_WEB}}': 'content/platforms/web.md',

  // Step 3: Adapters
  '{{CONTENT_ADAPTER_JUST_AUDIO}}': 'content/adapters/just_audio.md',
  '{{CONTENT_ADAPTER_MEDIA_KIT}}': 'content/adapters/media_kit.md',
  '{{CONTENT_ADAPTER_MANUAL}}': 'content/adapters/manual.md',

  // Step 4: Features
  '{{CONTENT_FEATURE_ACTION_SLOT}}': 'content/features/action_slot.md',
  '{{CONTENT_FEATURE_KEEP_ALIVE}}': 'content/features/keep_alive.md',
  '{{CONTENT_FEATURE_SKIP_INTERVALS}}': 'content/features/skip_intervals.md',
  '{{CONTENT_FEATURE_INTERRUPTIONS}}': 'content/features/interruptions.md',
  '{{CONTENT_FEATURE_AVAILABLE_ACTIONS}}': 'content/features/available_actions.md',
  '{{CONTENT_FEATURE_LIFECYCLE}}': 'content/features/lifecycle.md',
  '{{CONTENT_FEATURE_WINDOWS_AUMID}}': 'content/features/windows_aumid.md',
};

// Versions from 3.1 onwards (Major.Minor tracking, ignoring patch differences)
const SUPPORTED_VERSIONS = [
  { slug: 'v3.1', label: 'v3.1', spec: '^3.1.0' }
];
const LATEST_SLUG = 'v3.1';
const LATEST_LABEL = 'v3.1';
const LATEST_SPEC = '^3.1.0';

function generateVersionOptions(currentVersionSlug, isLatestRoot = false) {
  let options = [];
  
  // Latest entry
  const latestSelected = isLatestRoot ? ' selected' : '';
  options.push(`<option value="latest"${latestSelected}>Latest (${LATEST_LABEL})</option>`);
  
  for (const ver of SUPPORTED_VERSIONS) {
    if (ver.slug === LATEST_SLUG) continue; // Avoid redundant entry for the latest release series
    const isSelected = (!isLatestRoot && ver.slug === currentVersionSlug) ? ' selected' : '';
    options.push(`<option value="${ver.slug}"${isSelected}>${ver.label}</option>`);
  }
  return options.join('\n          ');
}

function renderHtml(templateHtml, versionSlug, isLatestRoot = false) {
  let html = templateHtml;

  // Canonical URL for SEO
  const canonicalUrl = isLatestRoot
    ? `${SITE_BASE_URL}/flutter-media-session/`
    : `${SITE_BASE_URL}/flutter-media-session/${versionSlug}/`;

  html = html.replace(/\{\{CANONICAL_URL\}\}/g, canonicalUrl);

  // Determine if this is an older/outdated version than latest
  // Only display the warning banner if it's explicitly not the latest version series!
  const isOutdatedVersion = !isLatestRoot && (versionSlug !== LATEST_SLUG);

  let alertBanner = '';
  if (isOutdatedVersion) {
    alertBanner = `
<div class="version-notice-banner" role="alert">
  <svg class="icon" style="fill: #f59e0b; width:20px; height:20px;" aria-hidden="true"><use href="#icon-warning"></use></svg>
  <div>
    <strong>Note:</strong> You are viewing an older documentation release (<strong>${versionSlug}</strong>). 
    Running <code>flutter pub add</code> will install the latest version. If you specifically need this release, specify the version or <a href="/flutter-media-session/">switch to the latest documentation</a>.
  </div>
</div>
`;
  }

  // Process content mappings
  const currentSpec = isLatestRoot ? LATEST_SPEC : (SUPPORTED_VERSIONS.find(v => v.slug === versionSlug)?.spec || '^3.1.0');

  for (const [placeholder, relativeMdPath] of Object.entries(contentMapping)) {
    const mdPath = path.join(__dirname, relativeMdPath);
    if (!fs.existsSync(mdPath)) {
      console.warn(`Warning: Missing markdown file: ${relativeMdPath}`);
      html = html.replace(placeholder, `<p><em>Content missing: ${relativeMdPath}</em></p>`);
      continue;
    }

    let mdContent = fs.readFileSync(mdPath, 'utf8');
    mdContent = mdContent.replace('{{OLD_VERSION_ALERT}}', alertBanner);
    mdContent = mdContent.replace(/\{\{PACKAGE_VERSION_SPEC\}\}/g, currentSpec);
    const parsedHtml = marked.parse(mdContent);
    html = html.replace(placeholder, parsedHtml);
  }

  const versionOptions = generateVersionOptions(versionSlug, isLatestRoot);
  html = html.replace('{{VERSION_OPTIONS}}', versionOptions);

  return html;
}

function copyScreenshots(targetImgDir) {
  const localImgDir = path.join(__dirname, 'doc/img/screenshot');
  const parentImgDir = path.resolve(__dirname, '../../doc/img/screenshot');
  const srcImgDir = fs.existsSync(localImgDir) ? localImgDir : parentImgDir;
  if (fs.existsSync(srcImgDir)) {
    fs.mkdirSync(targetImgDir, { recursive: true });
    fs.cpSync(srcImgDir, targetImgDir, { recursive: true });
  }
}

async function build() {
  console.log('Building Interactive Usage Guide for Cloudflare Pages (Major.Minor mode)...');

  const templatePath = path.join(__dirname, 'template.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Root redirect rule: / -> /flutter-media-session/
  const rootIndexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; url=/flutter-media-session/">
  <link rel="canonical" href="${SITE_BASE_URL}/flutter-media-session/">
</head>
<body>
  <script>window.location.replace('/flutter-media-session/');</script>
</body>
</html>`;
  fs.writeFileSync(path.join(distDir, 'index.html'), rootIndexHtml, 'utf8');

  // Cloudflare _redirects support
  // Redirect legacy patch paths to /v3.1/
  const redirects = [
    '/ /flutter-media-session/ 302',
    '/flutter-media-session /flutter-media-session/ 301',
    '/flutter-media-session/v3.1.* /flutter-media-session/v3.1/ 301'
  ];
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects.join('\n'), 'utf8');

  // 2. Build Latest: dist/flutter-media-session/
  const latestDir = path.join(distDir, 'flutter-media-session');
  fs.mkdirSync(latestDir, { recursive: true });
  copyScreenshots(path.join(latestDir, 'img/screenshot'));
  
  const latestHtml = renderHtml(templateHtml, LATEST_SLUG, true);
  fs.writeFileSync(path.join(latestDir, 'index.html'), latestHtml, 'utf8');
  console.log(`Generated latest guide at: ${path.relative(__dirname, path.join(latestDir, 'index.html'))}`);

  // 3. Build each version: dist/flutter-media-session/{version}/
  for (const ver of SUPPORTED_VERSIONS) {
    const verDir = path.join(latestDir, ver.slug);
    fs.mkdirSync(verDir, { recursive: true });
    copyScreenshots(path.join(verDir, 'img/screenshot'));

    const verHtml = renderHtml(templateHtml, ver.slug, false);
    fs.writeFileSync(path.join(verDir, 'index.html'), verHtml, 'utf8');
    console.log(`Generated version [${ver.slug}] guide at: ${path.relative(__dirname, path.join(verDir, 'index.html'))}`);
  }

  // 4. Generate SEO robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
  console.log('Generated robots.txt');

  // 5. Generate SEO sitemap.xml
  const currentDate = new Date().toISOString().split('T')[0];
  const sitemapUrls = [
    { loc: `${SITE_BASE_URL}/flutter-media-session/`, priority: '1.0', changefreq: 'weekly' },
    ...SUPPORTED_VERSIONS.map(ver => ({
      loc: `${SITE_BASE_URL}/flutter-media-session/${ver.slug}/`,
      priority: '0.8',
      changefreq: 'monthly'
    }))
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('Generated sitemap.xml');

  console.log('Successfully built guide into dist/');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
