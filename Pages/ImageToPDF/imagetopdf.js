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


    // --- MAIN TOOLS CORE APPLICATION ENGINES ---
    const pdfDropZone = document.getElementById('pdfDropZone');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfWorkspace = document.getElementById('pdfWorkspace');
    const visualEditorGrid = document.getElementById('visualEditorGrid');
    const compilePdfBtn = document.getElementById('compilePdfBtn');

    let documentPagesList = [];

    pdfDropZone.addEventListener('click', () => pdfFileInput.click());

    pdfDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfDropZone.classList.add('dragover');
    });

    pdfDropZone.addEventListener('dragleave', () => pdfDropZone.classList.remove('dragover'));

    pdfDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        pdfDropZone.classList.remove('dragover');
        processIncomingFiles(e.dataTransfer.files);
    });

    pdfFileInput.addEventListener('change', (e) => {
        processIncomingFiles(e.target.files);
    });

    async function processIncomingFiles(files) {
        for (let file of files) {
            if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
                const base64DataUrl = await convertToDataStream(file);
                
                documentPagesList.push({
                    id: 'page_' + Date.now() + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    src: base64DataUrl,
                    scale: 100 
                });
            }
        }
        
        if (documentPagesList.length > 0) {
            renderEditorGrid();
            pdfWorkspace.style.display = 'flex';
        }
    }

    function renderEditorGrid() {
        visualEditorGrid.innerHTML = '';

        documentPagesList.forEach((page, index) => {
            const card = document.createElement('div');
            card.className = 'page-editor-card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-id', page.id);

            card.innerHTML = `
                <div class="card-top-controls">
                    <span class="page-number-tag">Page ${index + 1}</span>
                    <button class="btn-delete-card" title="Discard Page">✕</button>
                </div>
                <div class="card-thumb-display">
                    <img src="${page.src}" alt="Blueprints Frame Display" style="transform: scale(${page.scale / 100});">
                </div>
                <div class="card-scale-controls">
                    <div class="scale-label-row">
                        <span>Scale Ratio</span>
                        <span class="scale-val">${page.scale}%</span>
                    </div>
                    <input type="range" class="card-scale-slider" min="30" max="100" value="${page.scale}">
                </div>
            `;

            const slider = card.querySelector('.card-scale-slider');
            const scaleDisplay = card.querySelector('.scale-val');
            const thumbImg = card.querySelector('.card-thumb-display img');

            slider.addEventListener('input', (e) => {
                const targetPercentage = parseInt(e.target.value);
                page.scale = targetPercentage; 
                scaleDisplay.innerText = targetPercentage + '%';
                thumbImg.style.transform = `scale(${targetPercentage / 100})`;
            });

            card.querySelector('.btn-delete-card').addEventListener('click', (e) => {
                e.stopPropagation();
                documentPagesList = documentPagesList.filter(p => p.id !== page.id);
                if (documentPagesList.length === 0) {
                    pdfWorkspace.style.display = 'none';
                } else {
                    renderEditorGrid();
                }
            });

            attachDragAndDropListeners(card);
            visualEditorGrid.appendChild(card);
        });
    }

    // --- SMOOTH SEQUENCE REORDERING LOGIC INTERFACES ---
    let draggedItemElement = null;

    function attachDragAndDropListeners(element) {
        element.addEventListener('dragstart', (e) => {
            draggedItemElement = element;
            setTimeout(() => element.classList.add('dragging'), 0);
        });

        element.addEventListener('dragend', () => {
            draggedItemElement.classList.remove('dragging');
            draggedItemElement = null;
            synchronizeCacheSequenceIndexes();
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            const boundingCards = [...visualEditorGrid.querySelectorAll('.page-editor-card:not(.dragging)')];
            
            const nextClosestCard = boundingCards.find(card => {
                const box = card.getBoundingClientRect();
                return e.clientX < box.left + box.width / 2;
            });

            if (!nextClosestCard) {
                visualEditorGrid.appendChild(draggedItemElement);
            } else {
                visualEditorGrid.insertBefore(draggedItemElement, nextClosestCard);
            }
        });
    }

    function synchronizeCacheSequenceIndexes() {
        const domElementsList = [...visualEditorGrid.querySelectorAll('.page-editor-card')];
        const freshOrderedCache = [];

        domElementsList.forEach((el, index) => {
            const targetedId = el.getAttribute('data-id');
            const originalObjectMatch = documentPagesList.find(p => p.id === targetedId);
            
            if (originalObjectMatch) {
                freshOrderedCache.push(originalObjectMatch);
                el.querySelector('.page-number-tag').innerText = `Page ${index + 1}`;
            }
        });

        documentPagesList = freshOrderedCache;
    }

    // --- PDF EXPORT ENGINE ---
    compilePdfBtn.addEventListener('click', async () => {
        if (documentPagesList.length === 0) return;

        compilePdfBtn.innerText = "Compiling Custom PDF Matrix...";
        compilePdfBtn.style.pointerEvents = "none";

        const { jsPDF } = window.jspdf;
        const pdfDoc = new jsPDF('p', 'mm', 'a4');
        const pdfSheetW = pdfDoc.internal.pageSize.getWidth();
        const pdfSheetH = pdfDoc.internal.pageSize.getHeight();

        for (let i = 0; i < documentPagesList.length; i++) {
            const pageData = documentPagesList[i];
            const rawDimensions = await fetchImageDimensions(pageData.src);

            const scalingFactor = pageData.scale / 100;
            const operationalWidth = rawDimensions.width * scalingFactor;
            const operationalHeight = rawDimensions.height * scalingFactor;

            const ratio = Math.min(pdfSheetW / operationalWidth, pdfSheetH / operationalHeight);
            const finalRenderedW = operationalWidth * ratio;
            const finalRenderedH = operationalHeight * ratio;

            const coordinateX = (pdfSheetW - finalRenderedW) / 2;
            const coordinateY = (pdfSheetH - finalRenderedH) / 2;

            if (i > 0) pdfDoc.addPage();

            pdfDoc.addImage(pageData.src, 'JPEG', coordinateX, coordinateY, finalRenderedW, finalRenderedH, undefined, 'FAST');
        }

        pdfDoc.save('saturn_studio_export.pdf');

        compilePdfBtn.innerText = "Compile & Export Premium PDF";
        compilePdfBtn.style.pointerEvents = "auto";
    });

    function convertToDataStream(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    function fetchImageDimensions(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.src = url;
        });
    }
});