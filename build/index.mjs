import fs from 'fs';
import path from 'path';

const distPath = path.resolve('./dist');
const rootPath = path.resolve('./');

/**
 * 📁 Recursively moves files and folders from src to dest
 */
function moveRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcItem = path.join(src, item);
    const destItem = path.join(dest, item);

    const stat = fs.statSync(srcItem);

    if (stat.isDirectory()) {
      if (!fs.existsSync(destItem)) fs.mkdirSync(destItem);
      moveRecursive(srcItem, destItem);
    } else {
      fs.copyFileSync(srcItem, destItem); // 📝 Copy file to destination
    }
  }
}

/**
 * 🧹 Recursively deletes a directory and its contents
 */
function deleteRecursive(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    const stat = fs.statSync(entryPath);

    if (stat.isDirectory()) {
      deleteRecursive(entryPath);
    } else {
      fs.unlinkSync(entryPath); // 🗑️ Delete file
    }
  }

  fs.rmdirSync(dir); // 🗑️ Delete empty directory
}

// 🚚 Move everything from "dist" to root
moveRecursive(distPath, rootPath);

// 🧹 Clean up "dist" folder
deleteRecursive(distPath);

console.log('✅ All contents from "dist" have been moved to the root folder.');
