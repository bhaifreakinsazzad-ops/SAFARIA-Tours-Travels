// Node script to replace legacy Tailwind class names with new design token classes
import fs from 'fs';
import path from 'path';
import { sync as glob } from 'glob';

const replaceMap: Record<string, string> = {
  'bg-surface-0': 'bg-sf-000',
  'bg-surface-100': 'bg-sf-100',
  'bg-surface-200': 'bg-sf-200',
  'bg-surface-input': 'bg-sf-input',
  'bg-surface-footer': 'bg-sf-footer',
  // Add any other mappings required
};

function replaceInFile(file: string) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [oldCls, newCls] of Object.entries(replaceMap)) {
    const escaped = oldCls.replace(/[\-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    content = content.replace(regex, newCls);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// Use sync glob to get file list
const tsxFiles = glob('src/**/*.tsx');
tsxFiles.forEach(replaceInFile);

const tsFiles = glob('src/**/*.ts');
tsFiles.forEach(replaceInFile);

const jsxFiles = glob('src/**/*.jsx');
jsxFiles.forEach(replaceInFile);

const jsFiles = glob('src/**/*.js');
jsFiles.forEach(replaceInFile);
