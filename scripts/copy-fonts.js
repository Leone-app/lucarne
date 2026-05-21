const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, '../src/admin/public/fonts');
fs.mkdirSync(dest, { recursive: true });

const files = [
  ['@fontsource/inter/files/inter-latin-200-normal.woff2', 'inter-latin-200-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-300-normal.woff2', 'inter-latin-300-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-latin-400-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-500-normal.woff2', 'inter-latin-500-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-latin-600-normal.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-300-normal.woff2', 'jetbrains-mono-latin-300-normal.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', 'jetbrains-mono-latin-400-normal.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', 'jetbrains-mono-latin-500-normal.woff2'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2', 'cormorant-garamond-latin-500-italic.woff2'],
];

for (const [src, name] of files) {
  const srcPath = path.join(__dirname, '../node_modules', src);
  const destPath = path.join(dest, name);
  fs.copyFileSync(srcPath, destPath);
}

console.log(`copied ${files.length} font files to src/admin/public/fonts/`);
