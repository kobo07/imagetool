# GitHub Pages 部署指南

## 问题诊断

如果在GitHub Pages上CSS样式失效或导航栏显示异常，请按以下步骤检查：

### 1. 检查GitHub Pages设置

1. 进入你的GitHub仓库
2. 点击 **Settings** > **Pages**
3. 确认 **Source** 设置为：
   - Branch: `main` (或 `master`)
   - Folder: `/ (root)`
4. 点击 **Save**

### 2. 清除浏览器缓存

GitHub Pages部署后，浏览器可能缓存了旧版本：

- **Chrome/Edge**: `Ctrl + Shift + Delete` → 清除缓存
- **Firefox**: `Ctrl + Shift + Delete` → 清除缓存
- 或使用无痕模式/隐私模式测试

### 3. 强制刷新页面

在GitHub Pages页面上：
- **Windows**: `Ctrl + F5` 或 `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 4. 检查文件路径

所有资源文件现在使用相对路径：
- ✅ `./styles.css`
- ✅ `./script.js`
- ✅ `./audio.js`
- ✅ `./index.html`
- ✅ `./audio.html`

### 5. 等待部署完成

GitHub Pages需要几分钟来构建和部署：
1. 提交并推送代码后
2. 在仓库的 **Actions** 标签页查看部署状态
3. 等待绿色勾号（部署成功）
4. 等待1-2分钟让CDN更新

### 6. 验证文件是否正确加载

在浏览器中打开开发者工具（F12）：
1. 切换到 **Network** 标签
2. 刷新页面
3. 检查 `styles.css` 是否返回 **200 OK**
4. 如果是 **404**，说明路径有问题

### 7. 常见问题

#### CSS完全不加载
- 检查 `.nojekyll` 文件是否存在（已创建）
- 确认文件名大小写正确（GitHub Pages区分大小写）

#### 导航栏图标很大
- 说明CSS未加载
- 按上述步骤清除缓存并强制刷新

#### 部分样式失效
- 检查浏览器控制台是否有CSS错误
- 确认所有CSS变量都已定义

## 部署步骤

```bash
# 1. 添加所有文件
git add .

# 2. 提交更改
git commit -m "Fix CSS paths for GitHub Pages"

# 3. 推送到GitHub
git push origin main

# 4. 等待2-3分钟

# 5. 访问你的GitHub Pages URL
# https://你的用户名.github.io/仓库名/
```

## 测试清单

部署后检查：
- [ ] 导航栏显示正常（图标大小正确）
- [ ] 页面样式完整（颜色、间距、布局）
- [ ] 主题切换功能正常
- [ ] 图片处理功能可用
- [ ] 音频处理功能可用
- [ ] 页面间导航正常

## 本地测试

在推送到GitHub之前，可以本地测试：

```bash
# 使用Python启动简单HTTP服务器
python -m http.server 8000

# 或使用Node.js的http-server
npx http-server

# 然后访问 http://localhost:8000
```

## 需要帮助？

如果问题仍然存在：
1. 检查浏览器控制台（F12）的错误信息
2. 在GitHub仓库的Issues中报告问题
3. 提供GitHub Pages URL和错误截图
