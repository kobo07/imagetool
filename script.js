// Global state
let uploadedFiles = [];
let processedResults = [];

// Format descriptions
const formatDescriptions = {
    original: '根据原始图片格式输出，不进行格式转换。',
    jpeg: '<strong>JPEG (Joint Photographic Experts Group)</strong><br>• 有损压缩格式，适合照片和复杂图像<br>• 文件体积小，压缩率高<br>• 不支持透明背景<br>• 广泛兼容，适合网页使用',
    png: '<strong>PNG (Portable Network Graphics)</strong><br>• 无损压缩格式，保留完整图像质量<br>• 支持透明背景和半透明效果<br>• 文件体积较大<br>• 适合图标、Logo、需要透明的图片',
    webp: '<strong>WebP</strong><br>• Google开发的现代图片格式<br>• 同时支持有损和无损压缩<br>• 比JPEG/PNG体积更小，质量相当<br>• 支持透明背景和动画<br>• 现代浏览器支持良好',
    bmp: '<strong>BMP (Bitmap)</strong><br>• 无压缩或轻压缩格式<br>• 文件体积非常大<br>• 图像质量最高，无损失<br>• 兼容性好但不适合网页使用',
    gif: '<strong>GIF (Graphics Interchange Format)</strong><br>• 支持动画和透明背景<br>• 最多256色，适合简单图形<br>• 文件体积小<br>• 不适合照片（色彩有限）<br>• 注意：通过Canvas转换会失去动画效果'
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const settingsSection = document.getElementById('settingsSection');
const previewSection = document.getElementById('previewSection');
const previewGrid = document.getElementById('previewGrid');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const formatSelect = document.getElementById('formatSelect');
const compressCheck = document.getElementById('compressCheck');
const compressSettings = document.getElementById('compressSettings');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const processBtn = document.getElementById('processBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const resetBtn = document.getElementById('resetBtn');
const pngWarning = document.getElementById('pngWarning');
const formatInfo = document.getElementById('formatInfo');
const themeToggle = document.getElementById('themeToggle');

// Event Listeners
uploadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('click', (e) => {
    // 只在点击上传区域本身时触发，不包括按钮
    if (e.target === uploadArea || e.target.closest('.upload-area') === uploadArea) {
        if (e.target !== uploadBtn && !uploadBtn.contains(e.target)) {
            fileInput.click();
        }
    }
});
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
compressCheck.addEventListener('change', toggleCompressSettings);
formatSelect.addEventListener('change', () => {
    updateFormatInfo();
    checkCompressionAvailability();
});
qualitySlider.addEventListener('input', updateQualityValue);
processBtn.addEventListener('click', processImages);
downloadAllBtn.addEventListener('click', downloadAll);
resetBtn.addEventListener('click', reset);
themeToggle.addEventListener('click', toggleTheme);

// File handling functions
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

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
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    addFiles(files);
}

function addFiles(files) {
    if (files.length === 0) return;

    uploadedFiles = [...uploadedFiles, ...files];
    updatePreview();
    settingsSection.style.display = 'block';
    previewSection.style.display = 'block';
    settingsSection.classList.add('fade-in');
    previewSection.classList.add('fade-in');
    checkCompressionAvailability();
}

function updatePreview() {
    previewGrid.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item fade-in';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="preview-image">
                <div class="preview-info">
                    <div class="preview-name" title="${file.name}">${file.name}</div>
                    <div class="preview-size">${formatFileSize(file.size)}</div>
                </div>
                <button class="preview-remove" onclick="removeFile(${index})">×</button>
            `;
            previewGrid.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updatePreview();
    
    if (uploadedFiles.length === 0) {
        settingsSection.style.display = 'none';
        previewSection.style.display = 'none';
    } else {
        checkCompressionAvailability();
    }
}

function toggleCompressSettings() {
    compressSettings.style.display = compressCheck.checked ? 'block' : 'none';
    checkCompressionAvailability();
}

function checkCompressionAvailability() {
    const format = formatSelect.value;
    const compress = compressCheck.checked;
    const hasPngFiles = uploadedFiles.some(file => file.type === 'image/png');
    
    // 如果是PNG文件、选择保持原格式、且启用了压缩，显示提示
    if (hasPngFiles && format === 'original' && compress) {
        pngWarning.style.display = 'block';
    } else {
        pngWarning.style.display = 'none';
    }
}

function updateFormatInfo() {
    const format = formatSelect.value;
    const description = formatDescriptions[format] || formatDescriptions.original;
    formatInfo.querySelector('.format-description').innerHTML = description;
}

function updateQualityValue() {
    qualityValue.textContent = qualitySlider.value;
}

// Image processing functions
async function processImages() {
    if (uploadedFiles.length === 0) return;

    processBtn.disabled = true;
    processBtn.innerHTML = '<div class="spinner"></div> 处理中...';
    
    processedResults = [];
    const format = formatSelect.value;
    const compress = compressCheck.checked;
    const quality = qualitySlider.value / 100;

    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        try {
            const result = await processImage(file, format, compress, quality);
            processedResults.push(result);
        } catch (error) {
            console.error('Error processing image:', error);
        }
    }

    displayResults();
    processBtn.disabled = false;
    processBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        开始处理
    `;
}

async function processImage(file, format, compress, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Determine output format
                let outputFormat = file.type;
                let extension = file.name.split('.').pop();
                
                if (format !== 'original') {
                    switch (format) {
                        case 'jpeg':
                            outputFormat = 'image/jpeg';
                            extension = 'jpg';
                            break;
                        case 'png':
                            outputFormat = 'image/png';
                            extension = 'png';
                            break;
                        case 'webp':
                            outputFormat = 'image/webp';
                            extension = 'webp';
                            break;
                        case 'bmp':
                            outputFormat = 'image/bmp';
                            extension = 'bmp';
                            break;
                        case 'gif':
                            // GIF通过canvas会失去动画，转为静态图
                            outputFormat = 'image/gif';
                            extension = 'gif';
                            break;
                    }
                }

                // 如果保持原格式且启用压缩，PNG自动转换为JPEG
                if (format === 'original' && compress && file.type === 'image/png') {
                    outputFormat = 'image/jpeg';
                    extension = 'jpg';
                }
                
                // 如果保持原格式且不压缩，其他无损格式也保持原样
                // 如果选择了具体格式，所有图片都转为该格式（已在上面的switch处理）

                // Apply compression quality (only works for JPEG and WebP)
                let outputQuality = 0.92; // Default high quality
                if (compress) {
                    outputQuality = quality;
                }
                // PNG doesn't support quality parameter, always use 1.0
                if (outputFormat === 'image/png') {
                    outputQuality = 1.0;
                }
                
                canvas.toBlob((blob) => {
                    const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.' + extension;
                    const processedFile = new File([blob], newFileName, { type: outputFormat });
                    
                    // Calculate compression ratio
                    const originalSize = file.size;
                    const newSize = blob.size;
                    const compressionRatio = ((1 - newSize / originalSize) * 100).toFixed(1);
                    
                    resolve({
                        original: file,
                        processed: processedFile,
                        originalSize: originalSize,
                        newSize: newSize,
                        compressionRatio: compressionRatio,
                        dataUrl: URL.createObjectURL(blob),
                        fileName: newFileName
                    });
                }, outputFormat, outputQuality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function displayResults() {
    resultsGrid.innerHTML = '';
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');

    processedResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item fade-in';
        
        const compressionClass = result.newSize < result.originalSize ? 'success' : '';
        const compressionText = result.newSize < result.originalSize 
            ? `↓ ${result.compressionRatio}%` 
            : `↑ ${Math.abs(result.compressionRatio)}%`;

        resultItem.innerHTML = `
            <img src="${result.dataUrl}" alt="${result.fileName}" class="result-image">
            <div class="result-info">
                <div class="result-name" title="${result.fileName}">${result.fileName}</div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="stat-label">原始大小:</span>
                        <span class="stat-value">${formatFileSize(result.originalSize)}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">处理后:</span>
                        <span class="stat-value ${compressionClass}">${formatFileSize(result.newSize)}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">变化:</span>
                        <span class="stat-value ${compressionClass}">${compressionText}</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="downloadSingle(${index})">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        下载
                    </button>
                </div>
            </div>
        `;
        resultsGrid.appendChild(resultItem);
    });

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadSingle(index) {
    const result = processedResults[index];
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.fileName;
    link.click();
}

async function downloadAll() {
    if (processedResults.length === 0) return;
    
    // 显示加载状态
    downloadAllBtn.disabled = true;
    downloadAllBtn.innerHTML = '<div class="spinner"></div> 打包中...';
    
    try {
        const zip = new JSZip();
        
        // 添加所有图片到ZIP
        for (let i = 0; i < processedResults.length; i++) {
            const result = processedResults[i];
            // 从dataUrl获取blob数据
            const response = await fetch(result.dataUrl);
            const blob = await response.blob();
            zip.file(result.fileName, blob);
        }
        
        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // 下载ZIP文件
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `processed-images-${timestamp}.zip`;
        link.click();
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (error) {
        console.error('打包下载失败:', error);
        alert('打包下载失败，请重试或单独下载图片');
    } finally {
        // 恢复按钮状态
        downloadAllBtn.disabled = false;
        downloadAllBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载全部
        `;
    }
}

function reset() {
    uploadedFiles = [];
    processedResults = [];
    previewGrid.innerHTML = '';
    resultsGrid.innerHTML = '';
    settingsSection.style.display = 'none';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    fileInput.value = '';
    formatSelect.value = 'original';
    compressCheck.checked = false;
    qualitySlider.value = 80;
    qualityValue.textContent = '80';
    compressSettings.style.display = 'none';
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Theme functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initTheme() {
    // 从localStorage获取保存的主题，默认为dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Estimate compressed size (called when quality slider changes)
qualitySlider.addEventListener('input', async () => {
    updateQualityValue();
    // You could add real-time size estimation here if needed
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    console.log('Image Processor initialized');
});
