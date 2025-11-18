# FFmpeg.wasm 本地部署指南

## 问题说明

在 GitHub Pages 上使用 FFmpeg.wasm 时遇到 CORS 错误：
```
Failed to construct 'Worker': Script at 'https://cdn.jsdelivr.net/...' 
cannot be accessed from origin 'https://kobo07.github.io'.
```

这是因为 FFmpeg.wasm 使用 Web Worker，而 GitHub Pages 不允许从外部 CDN 加载 Worker 脚本。

## 解决方案

### 方案 1：下载文件到本地（推荐）

1. **创建 libs 目录**
   ```bash
   mkdir libs
   cd libs
   ```

2. **下载 FFmpeg 核心文件**
   
   下载以下文件到 `libs` 目录：
   
   - https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js
   - https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js
   - https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm
   - https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js

3. **修改 HTML 引用**
   
   在 `video.html` 中：
   ```html
   <script src="./libs/ffmpeg.js"></script>
   ```

4. **修改 JS 配置**
   
   在 `video.js` 中：
   ```javascript
   await ffmpeg.load({
       coreURL: './libs/ffmpeg-core.js',
       wasmURL: './libs/ffmpeg-core.wasm',
       workerURL: './libs/ffmpeg-core.worker.js'
   });
   ```

### 方案 2：使用单文件版本（简单但较慢）

使用不需要 Worker 的单线程版本：

```html
<script src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"></script>
```

但这个版本性能较差，不推荐。

### 方案 3：使用代理服务

如果不想下载文件，可以使用 CORS 代理（不推荐生产环境）：

```javascript
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
await ffmpeg.load({
    coreURL: corsProxy + 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    // ...
});
```

## 推荐实施步骤

我将帮你实施**方案 1**，这是最稳定的解决方案。
