# FFmpeg.wasm 文件下载脚本
# 用于解决 GitHub Pages CORS 问题

Write-Host "开始下载 FFmpeg.wasm 文件..." -ForegroundColor Green

# 创建 libs 目录
$libsDir = "libs"
if (-not (Test-Path $libsDir)) {
    New-Item -ItemType Directory -Path $libsDir | Out-Null
    Write-Host "✓ 创建 libs 目录" -ForegroundColor Green
}

# 定义要下载的文件
$files = @(
    @{
        Url = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"
        Output = "$libsDir/ffmpeg.js"
        Name = "FFmpeg 主文件"
    },
    @{
        Url = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"
        Output = "$libsDir/ffmpeg-core.js"
        Name = "FFmpeg 核心 JS"
    },
    @{
        Url = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        Output = "$libsDir/ffmpeg-core.wasm"
        Name = "FFmpeg WASM"
    },
    @{
        Url = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js"
        Output = "$libsDir/ffmpeg-core.worker.js"
        Name = "FFmpeg Worker"
    }
)

# 下载文件
$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    Write-Host "`n[$currentFile/$totalFiles] 下载 $($file.Name)..." -ForegroundColor Cyan
    Write-Host "URL: $($file.Url)" -ForegroundColor Gray
    
    try {
        # 使用 Invoke-WebRequest 下载
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $file.Url -OutFile $file.Output -UseBasicParsing
        
        # 检查文件大小
        $fileSize = (Get-Item $file.Output).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        if ($fileSizeMB -gt 1) {
            Write-Host "✓ 下载成功 ($fileSizeMB MB)" -ForegroundColor Green
        } else {
            Write-Host "✓ 下载成功 ($fileSizeKB KB)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "✗ 下载失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n尝试使用备用 CDN..." -ForegroundColor Yellow
        
        # 尝试备用 CDN (jsDelivr)
        $backupUrl = $file.Url -replace "unpkg.com", "cdn.jsdelivr.net/npm"
        Write-Host "备用 URL: $backupUrl" -ForegroundColor Gray
        
        try {
            Invoke-WebRequest -Uri $backupUrl -OutFile $file.Output -UseBasicParsing
            $fileSize = (Get-Item $file.Output).Length
            $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
            Write-Host "✓ 从备用 CDN 下载成功 ($fileSizeKB KB)" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ 备用 CDN 也失败了: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "请手动下载: $($file.Url)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "下载完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# 检查所有文件是否存在
Write-Host "`n检查文件完整性..." -ForegroundColor Cyan
$allFilesExist = $true

foreach ($file in $files) {
    if (Test-Path $file.Output) {
        $fileSize = (Get-Item $file.Output).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "✓ $($file.Name): $fileSizeKB KB" -ForegroundColor Green
    } else {
        Write-Host "✗ $($file.Name): 缺失" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "`n✅ 所有文件下载完成！" -ForegroundColor Green
    Write-Host "`n下一步：运行以下命令应用配置" -ForegroundColor Yellow
    Write-Host "node update-video-config.js" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ 部分文件下载失败，请检查网络连接后重试" -ForegroundColor Yellow
}

Write-Host "`n按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
