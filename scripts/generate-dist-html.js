#!/usr/bin/env node

/**
 * 为 dist 目录下的所有 JS 文件生成对应的 HTML 文件
 * 使用 html-template.html 模板，用于构建后直接访问
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(workspaceRoot, 'dist');
const adminDir = path.resolve(workspaceRoot, 'admin');
const templatePath = path.join(adminDir, 'html-template.html');

let generatedCount = 0;

// 检查模板是否存在
if (!fs.existsSync(templatePath)) {
  console.error('错误: html-template.html 模板不存在，请先构建 prototype-admin');
  console.error('路径:', templatePath);
  process.exit(1);
}

// 检查 dist 目录是否存在
if (!fs.existsSync(distDir)) {
  console.log('dist 目录不存在，跳过 HTML 生成');
  process.exit(0);
}

const template = fs.readFileSync(templatePath, 'utf8');

/**
 * 递归遍历目录，为每个 JS 文件生成 HTML
 */
function generateHtmlForDirectory(dir, baseDir = distDir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // 递归处理子目录
      generateHtmlForDirectory(itemPath, baseDir);
    } else if (item.name.endsWith('.js') && !item.name.includes('.worker')) {
      // 为 JS 文件生成 HTML
      const relativePath = path.relative(baseDir, itemPath);
      const jsName = relativePath.replace('.js', '');
      const htmlPath = path.join(dir, item.name.replace('.js', '.html'));

      // 根据路径生成标题
      let title = 'Preview';
      if (jsName.startsWith('components/')) {
        const name = jsName.replace('components/', '');
        title = `Element: ${name}`;
      } else if (jsName.startsWith('prototypes/')) {
        const name = jsName.replace('prototypes/', '');
        title = `Page: ${name}`;
      }

      // 计算 JS 文件的相对路径（从 HTML 的位置）
      const jsFileName = `./${item.name}`;
      
      // 计算 bootstrap JS 的相对路径
      const relativeDir = path.relative(baseDir, dir);
      const depth = relativeDir ? relativeDir.split(path.sep).length : 0;
      const bootstrapPath = depth > 0 
        ? '../'.repeat(depth) + 'assets/html-template-bootstrap.js'
        : './assets/html-template-bootstrap.js';

      // 替换模板变量
      let html = template.replace('{{TITLE}}', title);
      html = html.replace('{{ENTRY}}', jsFileName);
      html = html.replace('{{BOOTSTRAP_PATH}}', bootstrapPath);

      // 写入 HTML 文件
      fs.writeFileSync(htmlPath, html, 'utf8');
      console.log(`生成: ${relativePath.replace('.js', '.html')}`);
      generatedCount++;
    }
  }
}

console.log('\n开始为 dist 目录生成 HTML 文件...\n');

generateHtmlForDirectory(distDir);

console.log(`\n完成！共生成 ${generatedCount} 个 HTML 文件。`);

// 为 GitHub Pages 构建添加 React 和 ReactDOM 的导出
if (process.env.GITHUB_PAGES) {
  console.log('\n为 GitHub Pages 构建处理 JS 文件...');
  
  // 不需要修改 JS 文件，HTML 模板会处理
  console.log('  使用 IIFE 格式，React 已打包在组件中');
}

// 生成导航首页 index.html
const indexPath = path.join(distDir, 'index.html');
const allHtmlFiles = [];

function collectHtmlFiles(dir, baseDir = distDir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      collectHtmlFiles(itemPath, baseDir);
    } else if (item.name.endsWith('.html')) {
      const relativePath = path.relative(baseDir, itemPath).replace(/\\/g, '/');
      allHtmlFiles.push(relativePath);
    }
  }
}

collectHtmlFiles(distDir);
allHtmlFiles.sort();

// 按目录分组
const groupedFiles = {};
for (const file of allHtmlFiles) {
  const parts = file.split('/');
  if (parts.length > 1) {
    const group = parts[0];
    if (!groupedFiles[group]) groupedFiles[group] = [];
    groupedFiles[group].push(file);
  }
}

// 生成 index.html
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>演员管理原型 - 导航</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #333;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #667eea;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    a {
      display: block;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      transition: all 0.2s;
    }
    a:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎭 演员管理原型</h1>
    ${Object.entries(groupedFiles).map(([group, files]) => `
    <div class="section">
      <h2>${group === 'prototypes' ? '📱 页面原型' : group === 'components' ? '🧩 组件' : group === 'themes' ? '🎨 主题' : group}</h2>
      <div class="grid">
        ${files.map(file => {
          const name = file.replace(/\.html$/, '').replace(/^[^\/]+\//, '');
          return `<a href="./${file}">${name}</a>`;
        }).join('\n        ')}
      </div>
    </div>`).join('\n    ')}
  </div>
</body>
</html>`;

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✓ 已生成导航首页: index.html');
console.log('模板文件: admin/html-template.html\n');

// 复制 bootstrap JS 到 dist/assets
const srcBootstrap = path.join(adminDir, 'assets/html-template-bootstrap.js');
const destAssetsDir = path.join(distDir, 'assets');
const destBootstrap = path.join(destAssetsDir, 'html-template-bootstrap.js');

if (fs.existsSync(srcBootstrap)) {
  if (!fs.existsSync(destAssetsDir)) {
    fs.mkdirSync(destAssetsDir, { recursive: true });
  }
  fs.copyFileSync(srcBootstrap, destBootstrap);
  console.log('✓ html-template-bootstrap.js 已复制到 dist/assets');
  
  // 同时复制其他必要的依赖（如果有的话）
  const assetsFiles = fs.readdirSync(path.join(adminDir, 'assets'));
  for (const file of assetsFiles) {
    // 复制 bootstrap 依赖的 chunk 文件
    if (file.startsWith('index-') && file.endsWith('.js')) {
      const src = path.join(adminDir, 'assets', file);
      const dest = path.join(destAssetsDir, file);
      fs.copyFileSync(src, dest);
      console.log(`✓ ${file} 已复制到 dist/assets`);
    }
  }
} else {
  console.warn('⚠ html-template-bootstrap.js 不存在，请先构建 prototype-admin');
}

