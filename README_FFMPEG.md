# 🎬 视频处理功能 - FFmpeg 本地部署

## 问题说明

你遇到的错误是 GitHub Pages 的 **CORS (跨域资源共享)** 限制：

```
Failed to construct 'Worker': Script at 'https://cdn.jsdelivr.net/...' 
cannot be accessed from origin 'https://kobo07.github.io'.
```

这是因为 FFmpeg.wasm 使用 Web Worker，而 GitHub Pages 不允许从外部 CDN 加载 Worker 脚本。

## ✅ 解决方案

我已经修改了配置，使用**本地文件**而不是 CDN。现在你需要下载 FFmpeg 文件到项目中。

## 📦 下载步骤

### 方法 1：使用 PowerShell 脚本（推荐）

1. **运行下载脚本**
   ```powershell
   .\download-ffmpeg.ps1
   ```

2. **等待下载完成**
   - 脚本会自动创建 `libs` 目录
   - 下载 4 个必需文件（约 30MB）
   - 显示下载进度和结果

### 方法 2：手动下载

如果脚本无法运行，手动下载以下文件：

1. **创建目录**
   ```bash
   mkdir libs
   ```

2. **下载文件到 `libs` 目录**

   | 文件名 | 下载链接 | 大小 |
   |--------|---------|------|
   | `ffmpeg.js` | [下载](https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js) | ~100KB |
   | `ffmpeg-core.js` | [下载](https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js) | ~500KB |
   | `ffmpeg-core.wasm` | [下载](https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm) | ~30MB |
   | `ffmpeg-core.worker.js` | [下载](https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js) | ~2KB |

3. **验证文件结构**
   ```
   windsurf-project/
   ├── libs/
   │   ├── ffmpeg.js
   │   ├── ffmpeg-core.js
   │   ├── ffmpeg-core.wasm
   │   └── ffmpeg-core.worker.js
   ├── video.html
   ├── video.js
   └── ...
   ```

## 🚀 部署到 GitHub Pages

下载完成后，按以下步骤部署：

1. **提交文件到 Git**
   ```bash
   git add libs/
   git add video.html video.js test-ffmpeg.html
   git commit -m "Add local FFmpeg files for video processing"
   git push
   ```

2. **等待 GitHub Pages 更新**
   - 通常需要 1-2 分钟
   - 访问你的网站测试

3. **测试功能**
   - 打开 `https://kobo07.github.io/video.html`
   - 上传一个视频文件
   - 应该能正常加载和处理

## 🔍 测试工具

使用 `test-ffmpeg.html` 诊断问题：

```
https://kobo07.github.io/test-ffmpeg.html
```

测试步骤：
1. ✅ 检查 FFmpeg 库
2. ✅ 测试本地文件
3. ✅ 加载 FFmpeg

如果所有测试通过，视频处理功能就可以正常使用了！

## 📁 文件说明

### 已修改的文件

- ✅ `video.html` - 改用本地 FFmpeg 库
- ✅ `video.js` - 配置本地文件路径
- ✅ `test-ffmpeg.html` - 更新测试配置

### 新增的文件

- 📄 `download-ffmpeg.ps1` - 自动下载脚本
- 📄 `FFMPEG_SETUP.md` - 详细设置说明
- 📄 `README_FFMPEG.md` - 本文件

### 需要下载的文件（到 libs 目录）

- 📦 `libs/ffmpeg.js`
- 📦 `libs/ffmpeg-core.js`
- 📦 `libs/ffmpeg-core.wasm`
- 📦 `libs/ffmpeg-core.worker.js`

## ⚠️ 注意事项

1. **文件大小**
   - `ffmpeg-core.wasm` 约 30MB
   - 确保 Git 可以提交大文件
   - 如果遇到问题，可能需要配置 Git LFS

2. **Git LFS 配置**（如果需要）
   ```bash
   git lfs install
   git lfs track "*.wasm"
   git add .gitattributes
   git commit -m "Track wasm files with Git LFS"
   ```

3. **浏览器缓存**
   - 部署后清除浏览器缓存
   - 或使用无痕模式测试

## 🎯 快速开始

```powershell
# 1. 下载 FFmpeg 文件
.\download-ffmpeg.ps1

# 2. 提交到 Git
git add libs/
git commit -m "Add FFmpeg local files"
git push

# 3. 等待部署完成后访问
# https://kobo07.github.io/video.html
```

## 💡 常见问题

### Q: 下载脚本无法运行？
A: 手动下载文件，或检查 PowerShell 执行策略：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: Git 无法提交大文件？
A: 使用 Git LFS 或将 wasm 文件托管在其他地方

### Q: 部署后还是报错？
A: 
1. 检查 `libs` 目录是否正确上传
2. 清除浏览器缓存
3. 使用 `test-ffmpeg.html` 诊断

### Q: 可以使用其他 CDN 吗？
A: 不行，GitHub Pages 的 CORS 策略不允许外部 Worker 脚本

---

完成以上步骤后，视频处理功能就可以在 GitHub Pages 上正常使用了！🎉
