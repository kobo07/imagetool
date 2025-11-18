// Global state
let uploadedFile = null;
let ffmpeg = null;
let ffmpegLoaded = false;
let originalVideoInfo = {};
let processedVideoBlob = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const previewSection = document.getElementById('previewSection');
const settingsSection = document.getElementById('settingsSection');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const ffmpegStatus = document.getElementById('ffmpegStatus');
const ffmpegStatusText = document.getElementById('ffmpegStatusText');

const videoPreview = document.getElementById('videoPreview');
const videoFileName = document.getElementById('videoFileName');
const videoFileSize = document.getElementById('videoFileSize');
const videoDuration = document.getElementById('videoDuration');
const videoResolution = document.getElementById('videoResolution');

const enableTrim = document.getElementById('enableTrim');
const trimSettings = document.getElementById('trimSettings');
const trimStart = document.getElementById('trimStart');
const trimEnd = document.getElementById('trimEnd');

const formatSelect = document.getElementById('formatSelect');
const compressionMode = document.getElementById('compressionMode');
const qualitySettings = document.getElementById('qualitySettings');
const targetSizeSettings = document.getElementById('targetSizeSettings');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const targetSize = document.getElementById('targetSize');

const enableResize = document.getElementById('enableResize');
const resizeSettings = document.getElementById('resizeSettings');
const resolutionPreset = document.getElementById('resolutionPreset');
const customResolution = document.getElementById('customResolution');
const customWidth = document.getElementById('customWidth');
const customHeight = document.getElementById('customHeight');

const processBtn = document.getElementById('processBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const processingStatus = document.getElementById('processingStatus');
const processingLogs = document.getElementById('processingLogs');

const resultVideo = document.getElementById('resultVideo');
const originalSize = document.getElementById('originalSize');
const originalDuration = document.getElementById('originalDuration');
const originalResolution = document.getElementById('originalResolution');
const processedSize = document.getElementById('processedSize');
const processedDuration = document.getElementById('processedDuration');
const processedResolution = document.getElementById('processedResolution');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

const themeToggle = document.getElementById('themeToggle');
const retryLoadBtn = document.getElementById('retryLoadBtn');
const ffmpegSpinner = document.getElementById('ffmpegSpinner');

// Event Listeners
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

enableTrim.addEventListener('change', toggleTrimSettings);
compressionMode.addEventListener('change', toggleCompressionSettings);
qualitySlider.addEventListener('input', updateQualityValue);
enableResize.addEventListener('change', toggleResizeSettings);
resolutionPreset.addEventListener('change', toggleCustomResolution);

processBtn.addEventListener('click', processVideo);
downloadBtn.addEventListener('click', downloadVideo);
resetBtn.addEventListener('click', reset);
themeToggle.addEventListener('click', toggleTheme);
retryLoadBtn.addEventListener('click', retryLoadFFmpeg);

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// File handling
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
    if (files.length > 0) {
        loadVideo(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        loadVideo(file);
    }
}

function loadVideo(file) {
    uploadedFile = file;
    const url = URL.createObjectURL(file);
    videoPreview.src = url;
    
    videoFileName.textContent = file.name;
    videoFileSize.textContent = formatFileSize(file.size);
    
    videoPreview.onloadedmetadata = () => {
        const duration = videoPreview.duration;
        const width = videoPreview.videoWidth;
        const height = videoPreview.videoHeight;
        
        videoDuration.textContent = formatDuration(duration);
        videoResolution.textContent = `${width} × ${height}`;
        
        trimEnd.value = duration.toFixed(1);
        trimEnd.max = duration;
        trimStart.max = duration;
        
        originalVideoInfo = {
            name: file.name,
            size: file.size,
            duration: duration,
            width: width,
            height: height
        };
        
        previewSection.style.display = 'block';
        settingsSection.style.display = 'block';
        previewSection.classList.add('fade-in');
        settingsSection.classList.add('fade-in');
    };
}

// Settings toggles
function toggleTrimSettings() {
    trimSettings.style.display = enableTrim.checked ? 'block' : 'none';
}

function toggleCompressionSettings() {
    const mode = compressionMode.value;
    if (mode === 'quality') {
        qualitySettings.style.display = 'block';
        targetSizeSettings.style.display = 'none';
    } else if (mode === 'size') {
        qualitySettings.style.display = 'none';
        targetSizeSettings.style.display = 'block';
    } else {
        qualitySettings.style.display = 'block';
        targetSizeSettings.style.display = 'none';
    }
}

function updateQualityValue() {
    qualityValue.textContent = qualitySlider.value;
}

function toggleResizeSettings() {
    resizeSettings.style.display = enableResize.checked ? 'block' : 'none';
}

function toggleCustomResolution() {
    customResolution.style.display = resolutionPreset.value === 'custom' ? 'block' : 'none';
}

// FFmpeg initialization
async function loadFFmpeg() {
    if (ffmpegLoaded) return;
    
    ffmpegStatus.style.display = 'block';
    ffmpegStatusText.textContent = '正在加载 FFmpeg...';
    
    // CDN sources to try
    const cdnSources = [
        {
            name: 'jsDelivr',
            coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        },
        {
            name: 'unpkg',
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        },
        {
            name: 'unpkg (mirror)',
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm',
        }
    ];
    
    try {
        const { FFmpeg } = FFmpegWASM;
        ffmpeg = new FFmpeg();
        
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
            addProcessingLog(message);
        });
        
        ffmpeg.on('progress', ({ progress, time }) => {
            const percent = Math.round(progress * 100);
            updateProgress(percent, `处理中: ${percent}% (${formatTime(time)})`);
        });
        
        // Try each CDN source
        let loaded = false;
        for (let i = 0; i < cdnSources.length; i++) {
            const source = cdnSources[i];
            try {
                ffmpegStatusText.textContent = `正在从 ${source.name} 加载 FFmpeg... (${i + 1}/${cdnSources.length})`;
                console.log(`Trying to load FFmpeg from ${source.name}...`);
                
                await ffmpeg.load({
                    coreURL: source.coreURL,
                    wasmURL: source.wasmURL,
                });
                
                loaded = true;
                console.log(`FFmpeg loaded successfully from ${source.name}`);
                break;
            } catch (err) {
                console.warn(`Failed to load from ${source.name}:`, err);
                if (i === cdnSources.length - 1) {
                    throw err; // Throw on last attempt
                }
            }
        }
        
        if (loaded) {
            ffmpegLoaded = true;
            ffmpegStatus.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to load FFmpeg from all sources:', error);
        ffmpegSpinner.style.display = 'none';
        retryLoadBtn.style.display = 'inline-flex';
        ffmpegStatusText.innerHTML = `
            ❌ 加载 FFmpeg 失败<br>
            <small style="color: var(--text-secondary); font-size: 0.9rem;">
                可能原因：网络连接问题或CDN无法访问<br>
                建议：检查网络后点击下方按钮重试
            </small>
        `;
    }
}

// Retry loading FFmpeg
function retryLoadFFmpeg() {
    ffmpegLoaded = false;
    ffmpeg = null;
    ffmpegSpinner.style.display = 'block';
    retryLoadBtn.style.display = 'none';
    ffmpegStatusText.textContent = '正在重新加载 FFmpeg...';
    loadFFmpeg();
}

// Video processing
async function processVideo() {
    if (!uploadedFile) {
        alert('请先上传视频文件');
        return;
    }
    
    // Load FFmpeg if not loaded
    if (!ffmpegLoaded) {
        await loadFFmpeg();
        if (!ffmpegLoaded) return;
    }
    
    processBtn.disabled = true;
    processingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    processingSection.classList.add('fade-in');
    processingLogs.innerHTML = '';
    
    updateProgress(0, '正在读取视频文件...');
    
    try {
        // Read file
        const fileData = await uploadedFile.arrayBuffer();
        const inputFileName = 'input' + getFileExtension(uploadedFile.name);
        await ffmpeg.writeFile(inputFileName, new Uint8Array(fileData));
        
        updateProgress(10, '正在分析视频参数...');
        
        // Build FFmpeg command
        const outputFormat = formatSelect.value;
        const outputFileName = `output.${outputFormat}`;
        const args = buildFFmpegArgs(inputFileName, outputFileName);
        
        updateProgress(20, '开始处理视频...');
        addProcessingLog(`执行命令: ffmpeg ${args.join(' ')}`);
        
        // Execute FFmpeg
        await ffmpeg.exec(args);
        
        updateProgress(90, '正在生成输出文件...');
        
        // Read output
        const data = await ffmpeg.readFile(outputFileName);
        processedVideoBlob = new Blob([data.buffer], { type: `video/${outputFormat}` });
        
        updateProgress(100, '处理完成！');
        
        // Display results
        displayResults();
        
        // Cleanup
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
        
    } catch (error) {
        console.error('Processing error:', error);
        addProcessingLog(`错误: ${error.message}`);
        alert('视频处理失败: ' + error.message);
    } finally {
        processBtn.disabled = false;
    }
}

function buildFFmpegArgs(inputFile, outputFile) {
    const args = ['-i', inputFile];
    
    // Trim settings
    if (enableTrim.checked) {
        const start = parseFloat(trimStart.value) || 0;
        const end = parseFloat(trimEnd.value);
        
        if (start > 0) {
            args.push('-ss', start.toString());
        }
        if (end > 0 && end > start) {
            args.push('-to', end.toString());
        }
    }
    
    // Resolution settings
    if (enableResize.checked) {
        let resolution = resolutionPreset.value;
        if (resolution === 'custom') {
            const w = parseInt(customWidth.value);
            const h = parseInt(customHeight.value);
            if (w > 0 && h > 0) {
                resolution = `${w}x${h}`;
            }
        }
        if (resolution && resolution !== 'original') {
            args.push('-vf', `scale=${resolution.replace('x', ':')}`);
        }
    }
    
    // Compression settings
    const mode = compressionMode.value;
    const format = formatSelect.value;
    
    if (format === 'mp4' || format === 'mov' || format === 'mkv') {
        args.push('-c:v', 'libx264');
        args.push('-preset', 'medium');
        
        if (mode === 'quality') {
            const crf = qualitySlider.value;
            args.push('-crf', crf);
        } else if (mode === 'size') {
            const targetSizeMB = parseFloat(targetSize.value) || 50;
            const bitrate = calculateBitrate(targetSizeMB);
            args.push('-b:v', bitrate);
            args.push('-maxrate', bitrate);
            args.push('-bufsize', (parseInt(bitrate) * 2) + 'k');
        } else {
            args.push('-crf', '23');
        }
        
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
    } else if (format === 'webm') {
        args.push('-c:v', 'libvpx-vp9');
        args.push('-crf', '30');
        args.push('-b:v', '0');
        args.push('-c:a', 'libopus');
        args.push('-b:a', '128k');
    } else if (format === 'avi') {
        args.push('-c:v', 'libx264');
        args.push('-crf', '23');
        args.push('-c:a', 'mp3');
        args.push('-b:a', '128k');
    }
    
    args.push(outputFile);
    
    return args;
}

function calculateBitrate(targetSizeMB) {
    // Calculate video bitrate based on target size
    // Formula: bitrate = (target_size * 8192) / duration - audio_bitrate
    const duration = enableTrim.checked 
        ? (parseFloat(trimEnd.value) || originalVideoInfo.duration) - (parseFloat(trimStart.value) || 0)
        : originalVideoInfo.duration;
    
    const targetSizeKB = targetSizeMB * 1024;
    const audioBitrate = 128; // kbps
    const videoBitrate = Math.floor((targetSizeKB * 8) / duration - audioBitrate);
    
    return Math.max(videoBitrate, 100) + 'k'; // Minimum 100kbps
}

function displayResults() {
    processingSection.style.display = 'none';
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Display result video
    const url = URL.createObjectURL(processedVideoBlob);
    resultVideo.src = url;
    
    // Original stats
    originalSize.textContent = formatFileSize(originalVideoInfo.size);
    originalDuration.textContent = formatDuration(originalVideoInfo.duration);
    originalResolution.textContent = `${originalVideoInfo.width} × ${originalVideoInfo.height}`;
    
    // Processed stats
    processedSize.textContent = formatFileSize(processedVideoBlob.size);
    
    resultVideo.onloadedmetadata = () => {
        processedDuration.textContent = formatDuration(resultVideo.duration);
        processedResolution.textContent = `${resultVideo.videoWidth} × ${resultVideo.videoHeight}`;
        
        // Calculate compression ratio
        const ratio = ((1 - processedVideoBlob.size / originalVideoInfo.size) * 100).toFixed(1);
        if (processedVideoBlob.size < originalVideoInfo.size) {
            processedSize.textContent += ` (↓ ${ratio}%)`;
            processedSize.classList.add('success');
        } else {
            processedSize.textContent += ` (↑ ${Math.abs(ratio)}%)`;
            processedSize.classList.remove('success');
        }
    };
    
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadVideo() {
    if (!processedVideoBlob) return;
    
    const format = formatSelect.value;
    const originalName = uploadedFile.name.replace(/\.[^/.]+$/, '');
    const fileName = `${originalName}_processed.${format}`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(processedVideoBlob);
    link.download = fileName;
    link.click();
}

function reset() {
    uploadedFile = null;
    processedVideoBlob = null;
    originalVideoInfo = {};
    
    videoPreview.src = '';
    resultVideo.src = '';
    fileInput.value = '';
    
    previewSection.style.display = 'none';
    settingsSection.style.display = 'none';
    processingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    
    enableTrim.checked = false;
    enableResize.checked = false;
    trimSettings.style.display = 'none';
    resizeSettings.style.display = 'none';
    
    formatSelect.value = 'mp4';
    compressionMode.value = 'quality';
    qualitySlider.value = 23;
    qualityValue.textContent = '23';
    targetSize.value = 50;
    resolutionPreset.value = 'original';
    
    toggleCompressionSettings();
}

// Utility functions
function updateProgress(percent, status) {
    progressFill.style.width = percent + '%';
    progressText.textContent = percent + '%';
    processingStatus.textContent = status;
}

function addProcessingLog(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    processingLogs.appendChild(logEntry);
    processingLogs.scrollTop = processingLogs.scrollHeight;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000000);
    return formatDuration(seconds);
}

function getFileExtension(filename) {
    return filename.slice(filename.lastIndexOf('.'));
}

// Initialize
initTheme();
