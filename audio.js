// Global state
let uploadedAudioFiles = [];
let processedAudioResults = [];
let currentEditAudioIndex = -1;
let wavesurfer = null;
let regionsPlugin = null;
let currentRegion = null;
let trimStartTime = 0;
let trimEndTime = 0;

// Format descriptions
const audioFormatDescriptions = {
    original: '根据原始音频格式输出，不进行格式转换。',
    mp3: '<strong>MP3 (MPEG Audio Layer III)</strong><br>• 有损压缩格式，广泛支持<br>• 文件体积小，适合流媒体<br>• 质量可调节<br>• 兼容性最好',
    wav: '<strong>WAV (Waveform Audio File Format)</strong><br>• 无损音频格式<br>• 文件体积大<br>• 音质最佳<br>• 适合专业音频处理',
    ogg: '<strong>OGG Vorbis</strong><br>• 开源有损压缩格式<br>• 比MP3更高效<br>• 现代浏览器支持良好<br>• 适合游戏和网页应用',
    m4a: '<strong>M4A (MPEG-4 Audio)</strong><br>• AAC编码格式<br>• 比MP3音质更好<br>• 苹果设备原生支持<br>• 适合移动设备'
};

// DOM Elements
const audioUploadArea = document.getElementById('audioUploadArea');
const audioFileInput = document.getElementById('audioFileInput');
const audioUploadBtn = document.getElementById('audioUploadBtn');
const audioSettingsSection = document.getElementById('audioSettingsSection');
const audioPreviewSection = document.getElementById('audioPreviewSection');
const audioPreviewGrid = document.getElementById('audioPreviewGrid');
const audioResultsSection = document.getElementById('audioResultsSection');
const audioResultsGrid = document.getElementById('audioResultsGrid');
const audioFormatSelect = document.getElementById('audioFormatSelect');
const audioCompressCheck = document.getElementById('audioCompressCheck');
const audioCompressSettings = document.getElementById('audioCompressSettings');
const bitrateSlider = document.getElementById('bitrateSlider');
const bitrateValue = document.getElementById('bitrateValue');
const audioProcessBtn = document.getElementById('audioProcessBtn');
const audioDownloadAllBtn = document.getElementById('audioDownloadAllBtn');
const audioResetBtn = document.getElementById('audioResetBtn');
const audioFormatInfo = document.getElementById('audioFormatInfo');
const themeToggle = document.getElementById('themeToggle');

// Audio Editor Modal Elements
const audioEditorModal = document.getElementById('audioEditorModal');
const closeAudioEditor = document.getElementById('closeAudioEditor');
const cancelAudioEdit = document.getElementById('cancelAudioEdit');
const applyAudioEdit = document.getElementById('applyAudioEdit');
const audioFileName = document.getElementById('audioFileName');
const audioDuration = document.getElementById('audioDuration');
const audioFileSize = document.getElementById('audioFileSize');
const audioFormat = document.getElementById('audioFormat');
const waveformContainer = document.getElementById('waveform');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const trimStartInput = document.getElementById('trimStartInput');
const trimEndInput = document.getElementById('trimEndInput');
const audioPlayer = document.getElementById('audioPlayer');

// Initialize WaveSurfer
function initWaveSurfer() {
    if (wavesurfer) {
        wavesurfer.destroy();
    }
    
    // Create WaveSurfer instance
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#6366f1',
        progressColor: '#4f46e5',
        cursorColor: '#ef4444',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 2,
        height: 200,
        barGap: 1,
        normalize: true,
        backend: 'WebAudio'
    });
    
    // Initialize regions plugin
    regionsPlugin = wavesurfer.registerPlugin(WaveSurfer.Regions.create());
    
    // Update time display during playback
    wavesurfer.on('audioprocess', () => {
        currentTime.textContent = formatTime(wavesurfer.getCurrentTime());
    });
    
    // Update button when playback finishes
    wavesurfer.on('finish', () => {
        playPauseBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            播放
        `;
    });
    
    // Update play/pause button
    wavesurfer.on('play', () => {
        playPauseBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            暂停
        `;
    });
    
    wavesurfer.on('pause', () => {
        playPauseBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            播放
        `;
    });
    
    // Handle region updates
    regionsPlugin.on('region-updated', (region) => {
        trimStartTime = region.start;
        trimEndTime = region.end;
        trimStartInput.value = trimStartTime.toFixed(2);
        trimEndInput.value = trimEndTime.toFixed(2);
    });
}

// Event Listeners
audioUploadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audioFileInput.click();
});

audioFileInput.addEventListener('change', handleAudioFileSelect);
audioUploadArea.addEventListener('click', (e) => {
    if (e.target === audioUploadArea || e.target.closest('.upload-area') === audioUploadArea) {
        if (e.target !== audioUploadBtn && !audioUploadBtn.contains(e.target)) {
            audioFileInput.click();
        }
    }
});

audioUploadArea.addEventListener('dragover', handleDragOver);
audioUploadArea.addEventListener('dragleave', handleDragLeave);
audioUploadArea.addEventListener('drop', handleAudioDrop);
audioCompressCheck.addEventListener('change', toggleAudioCompressSettings);
audioFormatSelect.addEventListener('change', updateAudioFormatInfo);
bitrateSlider.addEventListener('input', updateBitrateValue);
audioProcessBtn.addEventListener('click', processAudioFiles);
audioDownloadAllBtn.addEventListener('click', downloadAllAudio);
audioResetBtn.addEventListener('click', resetAudio);
themeToggle.addEventListener('click', toggleTheme);
closeAudioEditor.addEventListener('click', closeAudioEditorModal);
cancelAudioEdit.addEventListener('click', closeAudioEditorModal);
applyAudioEdit.addEventListener('click', applyAudioEditorChanges);
playPauseBtn.addEventListener('click', togglePlayPause);
stopBtn.addEventListener('click', stopAudio);
trimStartInput.addEventListener('input', updateTrimStart);
trimEndInput.addEventListener('input', updateTrimEnd);

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// File handling functions
function handleAudioFileSelect(e) {
    const files = Array.from(e.target.files);
    addAudioFiles(files);
}

function handleDragOver(e) {
    e.preventDefault();
    audioUploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    audioUploadArea.classList.remove('drag-over');
}

function handleAudioDrop(e) {
    e.preventDefault();
    audioUploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('audio/'));
    addAudioFiles(files);
}

function addAudioFiles(files) {
    if (files.length === 0) return;

    uploadedAudioFiles = [...uploadedAudioFiles, ...files];
    updateAudioPreview();
    audioSettingsSection.style.display = 'block';
    audioPreviewSection.style.display = 'block';
    audioSettingsSection.classList.add('fade-in');
    audioPreviewSection.classList.add('fade-in');
}

function updateAudioPreview() {
    audioPreviewGrid.innerHTML = '';
    
    uploadedAudioFiles.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item fade-in';
        
        // Get audio duration
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        audio.src = url;
        
        audio.addEventListener('loadedmetadata', () => {
            const duration = formatTime(audio.duration);
            previewItem.querySelector('.audio-duration').textContent = duration;
            URL.revokeObjectURL(url);
        });
        
        previewItem.innerHTML = `
            <div class="audio-preview-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            </div>
            <div class="preview-info">
                <div class="preview-name" title="${file.name}">${file.name}</div>
                <div class="preview-size">${formatFileSize(file.size)}</div>
                <div class="audio-duration">加载中...</div>
                <button class="btn btn-primary btn-small" onclick="openAudioEditor(${index})">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    编辑
                </button>
            </div>
            <button class="preview-remove" onclick="removeAudioFile(${index})">×</button>
        `;
        audioPreviewGrid.appendChild(previewItem);
    });
}

function removeAudioFile(index) {
    uploadedAudioFiles.splice(index, 1);
    updateAudioPreview();
    
    if (uploadedAudioFiles.length === 0) {
        audioSettingsSection.style.display = 'none';
        audioPreviewSection.style.display = 'none';
    }
}

function toggleAudioCompressSettings() {
    audioCompressSettings.style.display = audioCompressCheck.checked ? 'block' : 'none';
}

function updateAudioFormatInfo() {
    const format = audioFormatSelect.value;
    const description = audioFormatDescriptions[format] || audioFormatDescriptions.original;
    audioFormatInfo.querySelector('.format-description').innerHTML = description;
}

function updateBitrateValue() {
    bitrateValue.textContent = bitrateSlider.value;
}

// Audio processing functions (simulated - real conversion requires server-side processing)
async function processAudioFiles() {
    if (uploadedAudioFiles.length === 0) return;

    audioProcessBtn.disabled = true;
    audioProcessBtn.innerHTML = '<div class="spinner"></div> 处理中...';
    
    processedAudioResults = [];
    const format = audioFormatSelect.value;
    const compress = audioCompressCheck.checked;
    const bitrate = bitrateSlider.value;

    for (let i = 0; i < uploadedAudioFiles.length; i++) {
        const file = uploadedAudioFiles[i];
        try {
            // Note: Real audio conversion requires server-side processing or Web Audio API
            // This is a simplified version that simulates the process
            const result = await simulateAudioProcessing(file, format, compress, bitrate);
            processedAudioResults.push(result);
        } catch (error) {
            console.error('Error processing audio:', error);
        }
    }

    displayAudioResults();
    audioProcessBtn.disabled = false;
    audioProcessBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        开始处理
    `;
}

async function simulateAudioProcessing(file, format, compress, bitrate) {
    // This is a simulation. Real audio conversion requires server-side processing
    // or more complex Web Audio API usage with encoding libraries
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            let extension = file.name.split('.').pop();
            let outputFormat = file.type;
            
            if (format !== 'original') {
                switch (format) {
                    case 'mp3':
                        extension = 'mp3';
                        outputFormat = 'audio/mpeg';
                        break;
                    case 'wav':
                        extension = 'wav';
                        outputFormat = 'audio/wav';
                        break;
                    case 'ogg':
                        extension = 'ogg';
                        outputFormat = 'audio/ogg';
                        break;
                    case 'm4a':
                        extension = 'm4a';
                        outputFormat = 'audio/mp4';
                        break;
                }
            }
            
            // Simulate compression (in reality, this would require actual audio encoding)
            let simulatedSize = file.size;
            if (compress) {
                const compressionRatio = bitrate / 320; // Simulate based on bitrate
                simulatedSize = Math.floor(file.size * compressionRatio);
            }
            
            const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.' + extension;
            const compressionRatio = ((1 - simulatedSize / file.size) * 100).toFixed(1);
            
            resolve({
                original: file,
                originalSize: file.size,
                newSize: simulatedSize,
                compressionRatio: compressionRatio,
                fileName: newFileName,
                format: outputFormat,
                dataUrl: URL.createObjectURL(file) // In real scenario, this would be the converted file
            });
        };
        reader.readAsArrayBuffer(file);
    });
}

function displayAudioResults() {
    audioResultsGrid.innerHTML = '';
    audioResultsSection.style.display = 'block';
    audioResultsSection.classList.add('fade-in');

    processedAudioResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item fade-in';
        
        const compressionClass = result.newSize < result.originalSize ? 'success' : '';
        const compressionText = result.newSize < result.originalSize 
            ? `↓ ${result.compressionRatio}%` 
            : `↑ ${Math.abs(result.compressionRatio)}%`;

        resultItem.innerHTML = `
            <div class="audio-result-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            </div>
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
                    <button class="btn btn-primary" onclick="downloadSingleAudio(${index})">
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
        audioResultsGrid.appendChild(resultItem);
    });

    audioResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadSingleAudio(index) {
    const result = processedAudioResults[index];
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.fileName;
    link.click();
}

async function downloadAllAudio() {
    if (processedAudioResults.length === 0) return;
    
    audioDownloadAllBtn.disabled = true;
    audioDownloadAllBtn.innerHTML = '<div class="spinner"></div> 打包中...';
    
    try {
        const zip = new JSZip();
        
        for (let i = 0; i < processedAudioResults.length; i++) {
            const result = processedAudioResults[i];
            const response = await fetch(result.dataUrl);
            const blob = await response.blob();
            zip.file(result.fileName, blob);
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `processed-audio-${timestamp}.zip`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (error) {
        console.error('打包下载失败:', error);
        alert('打包下载失败，请重试或单独下载音频');
    } finally {
        audioDownloadAllBtn.disabled = false;
        audioDownloadAllBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载全部
        `;
    }
}

function resetAudio() {
    uploadedAudioFiles = [];
    processedAudioResults = [];
    audioPreviewGrid.innerHTML = '';
    audioResultsGrid.innerHTML = '';
    audioSettingsSection.style.display = 'none';
    audioPreviewSection.style.display = 'none';
    audioResultsSection.style.display = 'none';
    audioFileInput.value = '';
    audioFormatSelect.value = 'original';
    audioCompressCheck.checked = false;
    bitrateSlider.value = 128;
    bitrateValue.textContent = '128';
    audioCompressSettings.style.display = 'none';
}

// Audio Editor Functions
window.openAudioEditor = function(index) {
    currentEditAudioIndex = index;
    const file = uploadedAudioFiles[index];
    
    audioFileName.textContent = file.name;
    audioFileSize.textContent = formatFileSize(file.size);
    audioFormat.textContent = file.type.split('/')[1].toUpperCase();
    
    // Initialize WaveSurfer
    initWaveSurfer();
    
    // Load audio file
    const url = URL.createObjectURL(file);
    wavesurfer.load(url);
    
    wavesurfer.on('ready', () => {
        const duration = wavesurfer.getDuration();
        
        audioDuration.textContent = formatTime(duration);
        totalTime.textContent = formatTime(duration);
        currentTime.textContent = '0:00';
        
        trimStartTime = 0;
        trimEndTime = duration;
        trimStartInput.value = '0';
        trimEndInput.value = duration.toFixed(2);
        trimStartInput.max = duration.toFixed(2);
        trimEndInput.max = duration.toFixed(2);
        
        // Create initial region (selection area to keep)
        currentRegion = regionsPlugin.addRegion({
            start: 0,
            end: duration,
            color: 'rgba(16, 185, 129, 0.2)', // Green transparent overlay on selected area
            drag: true,
            resize: true
        });
        
        console.log('Waveform loaded successfully');
    });
    
    audioEditorModal.style.display = 'flex';
};

function togglePlayPause() {
    if (!wavesurfer) return;
    wavesurfer.playPause();
}

function stopAudio() {
    if (!wavesurfer) return;
    wavesurfer.stop();
    currentTime.textContent = '0:00';
}

function updateTrimStart() {
    if (!wavesurfer || !currentRegion) return;
    
    trimStartTime = parseFloat(trimStartInput.value) || 0;
    const duration = wavesurfer.getDuration();
    
    if (trimStartTime >= trimEndTime) {
        trimStartTime = Math.max(0, trimEndTime - 0.1);
        trimStartInput.value = trimStartTime.toFixed(2);
    }
    
    if (trimStartTime < 0) trimStartTime = 0;
    if (trimStartTime > duration) trimStartTime = duration;
    
    currentRegion.setOptions({
        start: trimStartTime,
        end: trimEndTime
    });
}

function updateTrimEnd() {
    if (!wavesurfer || !currentRegion) return;
    
    const duration = wavesurfer.getDuration();
    trimEndTime = parseFloat(trimEndInput.value) || duration;
    
    if (trimEndTime <= trimStartTime) {
        trimEndTime = Math.min(duration, trimStartTime + 0.1);
        trimEndInput.value = trimEndTime.toFixed(2);
    }
    
    if (trimEndTime < 0) trimEndTime = 0;
    if (trimEndTime > duration) trimEndTime = duration;
    
    currentRegion.setOptions({
        start: trimStartTime,
        end: trimEndTime
    });
}

function closeAudioEditorModal() {
    audioEditorModal.style.display = 'none';
    if (wavesurfer) {
        wavesurfer.stop();
        wavesurfer.destroy();
        wavesurfer = null;
    }
    currentEditAudioIndex = -1;
    currentRegion = null;
}

async function applyAudioEditorChanges() {
    if (!wavesurfer || currentEditAudioIndex === -1) return;
    
    // Get the audio buffer from WaveSurfer
    const audioBuffer = wavesurfer.getDecodedData();
    if (!audioBuffer) {
        alert('无法获取音频数据');
        return;
    }
    
    // Calculate the trim region
    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(trimStartTime * sampleRate);
    const endSample = Math.floor(trimEndTime * sampleRate);
    const trimmedLength = endSample - startSample;
    
    // Create a new audio buffer with the trimmed audio
    const numberOfChannels = audioBuffer.numberOfChannels;
    const trimmedBuffer = new AudioContext().createBuffer(
        numberOfChannels,
        trimmedLength,
        sampleRate
    );
    
    // Copy the trimmed audio data
    for (let channel = 0; channel < numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
            trimmedData[i] = originalData[startSample + i];
        }
    }
    
    // Convert the trimmed buffer to WAV format
    const wavBlob = audioBufferToWav(trimmedBuffer);
    const file = uploadedAudioFiles[currentEditAudioIndex];
    const newFileName = file.name.replace(/\\.[^/.]+$/, '') + '_trimmed.wav';
    const newFile = new File([wavBlob], newFileName, { type: 'audio/wav' });
    
    // Replace the original file with the trimmed version
    uploadedAudioFiles[currentEditAudioIndex] = newFile;
    
    // Update preview
    updateAudioPreview();
    
    alert('音频裁剪成功！已替换为裁剪后的版本。');
    closeAudioEditorModal();
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;
    
    // Write WAV header
    const setUint16 = (data) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };
    const setUint32 = (data) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };
    
    // RIFF identifier
    setUint32(0x46464952);
    // file length
    setUint32(length - 8);
    // RIFF type
    setUint32(0x45564157);
    // format chunk identifier
    setUint32(0x20746d66);
    // format chunk length
    setUint32(16);
    // sample format (raw)
    setUint16(1);
    // channel count
    setUint16(buffer.numberOfChannels);
    // sample rate
    setUint32(buffer.sampleRate);
    // byte rate (sample rate * block align)
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
    // block align (channel count * bytes per sample)
    setUint16(buffer.numberOfChannels * 2);
    // bits per sample
    setUint16(16);
    // data chunk identifier
    setUint32(0x61746164);
    // data chunk length
    setUint32(length - pos - 4);
    
    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }
    
    while (pos < length) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Make functions globally accessible
window.removeAudioFile = removeAudioFile;
window.downloadSingleAudio = downloadSingleAudio;
