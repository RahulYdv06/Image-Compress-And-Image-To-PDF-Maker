document.addEventListener('DOMContentLoaded', () => {
    
    // --- RESPONSIVE MOBILE SIDE MENU TOGGLE DRAWERS MECHANICS ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('open');
        mobileDrawer.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!mobileDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('open');
            mobileDrawer.classList.remove('open');
        }
    });


    // --- IMAGE COMPRESSOR CORE ENGINE ---
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const workspace = document.getElementById('workspace');
    const previewImg = document.getElementById('previewImg');
    const qualitySlider = document.getElementById('quality');
    const qualityVal = document.getElementById('qualityVal');
    const origSizeTxt = document.getElementById('origSize');
    const compSizeTxt = document.getElementById('compSize');
    const savingRibbon = document.getElementById('savingRibbon');
    const savingPercentage = document.getElementById('savingPercentage');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalImage = new Image();
    let rawFileSize = 0;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            initiateFileStream(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            initiateFileStream(e.target.files[0]);
        }
    });

    function initiateFileStream(file) {
        if (!file.type.startsWith('image/')) {
            alert('File type error. Please upload a standard image file.');
            return;
        }

        rawFileSize = file.size;
        origSizeTxt.innerText = formatSize(rawFileSize);

        const reader = new FileReader();
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);

        originalImage.onload = function() {
            workspace.style.display = 'flex';
            workspace.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            compressImage();
        };
    }

    function compressImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const qualityFactor = parseInt(qualitySlider.value);
        let scale = 1.0;

        if (qualityFactor < 40) {
            scale = 0.35 + (qualityFactor / 40) * 0.65; 
        }

        const targetWidth = Math.max(originalImage.naturalWidth * scale, 1);
        const targetHeight = Math.max(originalImage.naturalHeight * scale, 1);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        const renderingQuality = qualityFactor / 100;
        const compressedDataUrl = canvas.toDataURL('image/jpeg', renderingQuality);
        const finalSizeInBytes = calculateBytes(compressedDataUrl);

        compSizeTxt.innerText = formatSize(finalSizeInBytes);
        downloadBtn.href = compressedDataUrl;

        if (finalSizeInBytes < rawFileSize) {
            const performanceSavings = ((rawFileSize - finalSizeInBytes) / rawFileSize * 100).toFixed(0);
            savingPercentage.innerText = `${performanceSavings}%`;
            savingRibbon.style.display = 'block';
        } else {
            savingRibbon.style.display = 'none';
        }
    }

    function calculateBytes(base64Str) {
        const paddingStripped = base64Str.length - 'data:image/jpeg;base64,'.length;
        return 4 * Math.ceil((paddingStripped / 3)) * 0.562486;
    }

    qualitySlider.addEventListener('input', (e) => {
        qualityVal.innerText = `${e.target.value}%`;
        compressImage();
    });

    function formatSize(bytes) {
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        } else {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
    }
});