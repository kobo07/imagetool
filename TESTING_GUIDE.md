# 🧪 测试指南

## ⚠️ 重要：本地文件限制

**直接在浏览器中打开 HTML 文件（file:// 协议）会遇到限制！**

浏览器的安全策略不允许 `file://` 协议加载 Web Workers 和某些资源。

## ✅ 正确的测试方法

### 方法 1：使用本地 HTTP 服务器（推荐）

#### 使用 Python
```powershell
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 使用 Node.js
```powershell
# 安装 http-server（仅需一次）
npm install -g http-server

# 启动服务器
http-server -p 8000
```

#### 使用 PHP
```powershell
php -S localhost:8000
```

然后访问：
- http://localhost:8000/test-simple.html
- http://localhost:8000/test-local.html
- http://localhost:8000/video.html

### 方法 2：使用 VS Code Live Server

1. 安装 "Live Server" 扩展
2. 右键点击 HTML 文件
3. 选择 "Open with Live Server"

### 方法 3：直接部署到 GitHub Pages 测试

```bash
git add .
git commit -m "Add FFmpeg local files"
git push
```

等待 1-2 分钟后访问：
- https://kobo07.github.io/test-simple.html
- https://kobo07.github.io/video.html

## 🔍 诊断工具

### test-simple.html
**最简单的诊断工具**
- 检查 FFmpeg 库是否加载
- 测试 FFmpeg 实例创建
- 详细的错误日志

**使用方法：**
```
http://localhost:8000/test-simple.html
```

点击按钮：
1. **基础测试** - 检查库和类
2. **加载测试** - 尝试加载 FFmpeg

### test-local.html
**快速文件检查**
- 验证所有文件是否存在
- 显示文件大小
- 自动运行

**使用方法：**
```
http://localhost:8000/test-local.html
```

### test-ffmpeg.html
**完整诊断工具**
- 三步完整测试
- 详细日志
- 手动控制

**使用方法：**
```
http://localhost:8000/test-ffmpeg.html
```

## ❌ 常见错误

### 错误 1: "undefined"
**原因：** 直接用 file:// 打开
**解决：** 使用 HTTP 服务器

### 错误 2: "Failed to construct 'Worker'"
**原因：** CORS 限制或 file:// 协议
**解决：** 使用本地服务器或部署到 GitHub Pages

### 错误 3: "Failed to fetch"
**原因：** 文件路径错误或文件不存在
**解决：** 检查 libs 目录中的文件

### 错误 4: "Cannot read properties of undefined"
**原因：** FFmpeg 库未正确加载
**解决：** 检查 libs/ffmpeg.js 是否存在

## 📊 预期结果

### test-simple.html（基础测试）
```
✅ FFmpegWASM 已加载
✅ FFmpeg 类存在
✅ FFmpeg 实例创建成功
```

### test-simple.html（加载测试）
```
开始加载 FFmpeg...
✅ FFmpeg 加载成功！
loaded 状态: true
```

### test-local.html
```
✅ ffmpeg.js: 4.03 KB
✅ ffmpeg-core.js: 112 KB
✅ ffmpeg-core.wasm: 30.6 MB
✅ ffmpeg-core.worker.js: 2.85 KB
✅ 814.ffmpeg.js: 2.59 KB

🎉 所有文件测试通过！
```

## 🚀 快速开始

### 1. 启动本地服务器
```powershell
python -m http.server 8000
```

### 2. 打开测试页面
```
http://localhost:8000/test-simple.html
```

### 3. 查看结果
- 如果基础测试通过 → 点击"加载测试"
- 如果加载测试通过 → 打开 video.html 测试视频处理
- 如果有错误 → 查看浏览器控制台（F12）

### 4. 部署到线上
```bash
git add .
git commit -m "Add FFmpeg files and tests"
git push
```

## 💡 提示

1. **始终使用 HTTP 服务器测试**，不要直接打开 HTML 文件
2. **查看浏览器控制台**（F12）获取详细错误信息
3. **清除缓存**（Ctrl+Shift+Delete）如果遇到奇怪的问题
4. **使用无痕模式**（Ctrl+Shift+N）排除缓存影响

## 🎯 下一步

如果本地测试通过：
1. ✅ 提交代码到 Git
2. ✅ 推送到 GitHub
3. ✅ 等待 GitHub Pages 部署
4. ✅ 访问线上地址测试

如果本地测试失败：
1. 检查是否使用 HTTP 服务器
2. 查看浏览器控制台错误
3. 运行 test-simple.html 获取详细信息
4. 检查 libs 目录文件是否完整

---

**记住：必须使用 HTTP 服务器，不能直接打开 HTML 文件！** 🚨
