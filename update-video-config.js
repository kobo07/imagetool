// 自动更新 video.html 和 video.js 配置以使用本地 FFmpeg 文件
const fs = require('fs');
const path = require('path');

console.log('🔧 开始更新视频处理配置...\n');

// 1. 更新 video.html
const videoHtmlPath = path.join(__dirname, 'video.html');
let videoHtml = fs.readFileSync(videoHtmlPath, 'utf8');

// 替换 CDN 引用为本地文件
const oldScriptTag = '<script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>';
const newScriptTag = '<script src="./libs/ffmpeg.js"></script>';

if (videoHtml.includes(oldScriptTag)) {
    videoHtml = videoHtml.replace(oldScriptTag, newScriptTag);
    fs.writeFileSync(videoHtmlPath, videoHtml, 'utf8');
    console.log('✅ video.html 已更新');
} else {
    console.log('⚠️  video.html 已经是本地引用或找不到旧标签');
}

// 2. 更新 video.js
const videoJsPath = path.join(__dirname, 'video.js');
let videoJs = fs.readFileSync(videoJsPath, 'utf8');

// 替换 CDN 配置为本地文件
const oldLoadConfig = `await ffmpeg.load({
            coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        });`;

const newLoadConfig = `await ffmpeg.load({
            coreURL: './libs/ffmpeg-core.js',
            wasmURL: './libs/ffmpeg-core.wasm',
            workerURL: './libs/ffmpeg-core.worker.js'
        });`;

if (videoJs.includes('cdn.jsdelivr.net/npm/@ffmpeg/core')) {
    // 更新所有 CDN 源配置
    videoJs = videoJs.replace(
        /coreURL: 'https:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.js'/g,
        "coreURL: './libs/ffmpeg-core.js'"
    );
    videoJs = videoJs.replace(
        /wasmURL: 'https:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.wasm'/g,
        "wasmURL: './libs/ffmpeg-core.wasm'"
    );
    videoJs = videoJs.replace(
        /coreURL: 'https:\/\/unpkg\.com\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.js'/g,
        "coreURL: './libs/ffmpeg-core.js'"
    );
    videoJs = videoJs.replace(
        /wasmURL: 'https:\/\/unpkg\.com\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.wasm'/g,
        "wasmURL: './libs/ffmpeg-core.wasm'"
    );
    
    // 添加 workerURL（如果不存在）
    videoJs = videoJs.replace(
        /(wasmURL: '\.\/libs\/ffmpeg-core\.wasm',)\s*\}/g,
        "$1\n            workerURL: './libs/ffmpeg-core.worker.js'\n        }"
    );
    
    fs.writeFileSync(videoJsPath, videoJs, 'utf8');
    console.log('✅ video.js 已更新');
} else {
    console.log('⚠️  video.js 已经是本地配置或找不到 CDN 引用');
}

// 3. 更新 test-ffmpeg.html
const testHtmlPath = path.join(__dirname, 'test-ffmpeg.html');
let testHtml = fs.readFileSync(testHtmlPath, 'utf8');

if (testHtml.includes('cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg')) {
    testHtml = testHtml.replace(
        '<script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>',
        '<script src="./libs/ffmpeg.js"></script>'
    );
    
    // 更新测试脚本中的 URL
    testHtml = testHtml.replace(
        /url: 'https:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.js'/g,
        "url: './libs/ffmpeg-core.js'"
    );
    testHtml = testHtml.replace(
        /url: 'https:\/\/unpkg\.com\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.js'/g,
        "url: './libs/ffmpeg-core.js'"
    );
    testHtml = testHtml.replace(
        /coreURL: 'https:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.js'/g,
        "coreURL: './libs/ffmpeg-core.js'"
    );
    testHtml = testHtml.replace(
        /wasmURL: 'https:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.wasm'/g,
        "wasmURL: './libs/ffmpeg-core.wasm'"
    );
    testHtml = testHtml.replace(
        /coreURL: 'https:\/\/unpkg\.com\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.js'/g,
        "coreURL: './libs/ffmpeg-core.js'"
    );
    testHtml = testHtml.replace(
        /wasmURL: 'https:\/\/unpkg\.com\/@ffmpeg\/core@[\d.]+\/dist\/umd\/ffmpeg-core\.wasm'/g,
        "wasmURL: './libs/ffmpeg-core.wasm'"
    );
    
    // 添加 workerURL
    testHtml = testHtml.replace(
        /(wasmURL: '\.\/libs\/ffmpeg-core\.wasm',)\s*\}/g,
        "$1\n                    workerURL: './libs/ffmpeg-core.worker.js'\n                }"
    );
    
    fs.writeFileSync(testHtmlPath, testHtml, 'utf8');
    console.log('✅ test-ffmpeg.html 已更新');
} else {
    console.log('⚠️  test-ffmpeg.html 已经是本地配置');
}

console.log('\n✅ 配置更新完成！');
console.log('\n📝 请确保 libs 目录包含以下文件：');
console.log('   - ffmpeg.js');
console.log('   - ffmpeg-core.js');
console.log('   - ffmpeg-core.wasm');
console.log('   - ffmpeg-core.worker.js');
console.log('\n🚀 现在可以部署到 GitHub Pages 了！');
