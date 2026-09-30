/* global pdfjsLib, St */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/*
 * Para adicionar um novo processo: inclua uma entrada aqui
 * (a chave deve ser igual ao data-process-id do card no index.html).
 */
const PROCESSES = {
    'hugo-auler': {
        title: 'Inventário Hugo Auler',
        pdf: 'processos/Processo_de_Inventário_Hugo_Auler.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_inventario_hugo_auler.pdf'
    },
    'ana-lidia': {
        title: 'Caso Ana Lídia',
        pdf: 'processos/Processo_Ana_Lídia.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_caso_ana_lidia.pdf'
    },
    'oscar-niemeyer': {
        title: 'Oscar Niemeyer',
        pdf: 'processos/Processo_Oscar_Niemeyer.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_caso_oscar_niemeyer.pdf'
    }
};

const state = {
    pdf: null,
    pageFlip: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    renderedPages: [],
    totalPages: 0,
    currentId: null,
    loadedId: null,
    pageStates: [],
    renderToken: 0
};

const previewModal = document.getElementById('previewModal');
const readerModal = document.getElementById('readerModal');
let book = document.getElementById('book');
const bookStage = document.getElementById('bookStage');
const bookLoading = document.getElementById('bookLoading');
const pageCounter = document.getElementById('pageCounter');
const zoomValue = document.getElementById('zoomValue');
const previewViewport = document.getElementById('previewViewport');
const previewPages = document.getElementById('previewPages');
const previewZoomValue = document.getElementById('previewZoomValue');
const previewTitle = document.getElementById('previewTitle');
const readerTitle = document.getElementById('readerTitle');
const loadingHTML = bookLoading.innerHTML;

const processSearch = document.getElementById('processSearch');
const noResults = document.getElementById('noResults');

function openPreview(processId) {
    const proc = PROCESSES[processId];
    if (!proc) return;

    state.currentId = processId;

    previewTitle.textContent = proc.title;

    previewModal.classList.add('is-open');
    previewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setPreviewZoom(1);
    previewViewport.scrollTop = 0;
    previewViewport.scrollLeft = 0;

    renderPreviewPages(proc.preview);
    renderPreviewThumbnail(proc.pdf);
}

/*
 * Prévia com zoom: as páginas do PDF de apresentação são desenhadas em
 * canvas (em vez de um iframe), para permitir zoom in/out apontando
 * para o ponto desejado.
 */
const previewState = { zoom: 1, token: 0, pdf: null };

async function renderPreviewPages(url) {
    const token = ++previewState.token;

    if (previewState.pdf) {
        try { previewState.pdf.destroy(); } catch (e) { /* ignora */ }
        previewState.pdf = null;
    }

    previewPages.innerHTML = '<p class="preview-loading">Carregando prévia...</p>';

    try {
        const pdf = await pdfjsLib.getDocument(url).promise;

        if (token !== previewState.token) {
            pdf.destroy();
            return;
        }

        previewState.pdf = pdf;
        previewPages.innerHTML = '';

        for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            if (token !== previewState.token) return;

            const baseViewport = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({
                scale: 1800 / baseViewport.width
            });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            previewPages.appendChild(canvas);

            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport,
                background: '#ffffff'
            }).promise;

            page.cleanup();
        }
    } catch (error) {
        if (token !== previewState.token) return;
        console.error('Não foi possível renderizar a prévia:', error);
        previewPages.innerHTML =
            '<p class="preview-loading">Não foi possível carregar a prévia.</p>';
    }
}

function setPreviewZoom(value, clientX = null, clientY = null) {
    const newZoom = Math.max(.5, Math.min(3, value));

    const rect = previewViewport.getBoundingClientRect();
    const mx = clientX === null ? rect.width / 2 : clientX - rect.left;
    const my = clientY === null ? rect.height / 2 : clientY - rect.top;

    // Proporção do conteúdo que está sob o ponto apontado
    const oldWidth = previewPages.offsetWidth;
    const oldHeight = previewPages.offsetHeight;
    const ratioX = oldWidth
        ? (previewViewport.scrollLeft + mx - previewPages.offsetLeft) / oldWidth
        : 0.5;
    const ratioY = oldHeight
        ? (previewViewport.scrollTop + my - previewPages.offsetTop) / oldHeight
        : 0;

    previewState.zoom = newZoom;
    previewPages.style.width = `${newZoom * 100}%`;
    previewZoomValue.textContent = `${Math.round(newZoom * 100)}%`;

    // Mantém o ponto apontado no mesmo lugar da tela
    previewViewport.scrollLeft =
        ratioX * previewPages.offsetWidth + previewPages.offsetLeft - mx;
    previewViewport.scrollTop =
        ratioY * previewPages.offsetHeight + previewPages.offsetTop - my;
}

function setupPreviewZoom() {
    document.getElementById('previewZoomIn')
        .addEventListener('click', () => setPreviewZoom(previewState.zoom + .25));

    document.getElementById('previewZoomOut')
        .addEventListener('click', () => setPreviewZoom(previewState.zoom - .25));

    document.getElementById('previewZoomReset')
        .addEventListener('click', () => setPreviewZoom(1));

    // Ctrl + roda do mouse (ou pinça no trackpad) = zoom no ponto apontado
    previewViewport.addEventListener('wheel', event => {
        if (!event.ctrlKey) return;

        event.preventDefault();

        const step = event.deltaY < 0 ? .15 : -.15;
        setPreviewZoom(previewState.zoom + step, event.clientX, event.clientY);
    }, { passive: false });

    // Arrastar com o mouse para mover a página ampliada
    let drag = null;

    previewViewport.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;

        drag = {
            x: event.clientX,
            y: event.clientY,
            left: previewViewport.scrollLeft,
            top: previewViewport.scrollTop
        };

        previewViewport.classList.add('is-dragging');
        previewViewport.setPointerCapture(event.pointerId);
    });

    previewViewport.addEventListener('pointermove', event => {
        if (!drag) return;

        previewViewport.scrollLeft = drag.left - (event.clientX - drag.x);
        previewViewport.scrollTop = drag.top - (event.clientY - drag.y);
    });

    const endDrag = () => {
        drag = null;
        previewViewport.classList.remove('is-dragging');
    };

    previewViewport.addEventListener('pointerup', endDrag);
    previewViewport.addEventListener('pointercancel', endDrag);
}

function closePreview() {
    previewModal.classList.remove('is-open');
    previewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

async function renderPreviewThumbnail(previewUrl) {
    const canvas = document.getElementById('previewPageCanvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    try {
        // Miniatura = 1ª página do processo completo. disableAutoFetch evita
        // baixar o PDF inteiro só para desenhar a primeira página.
        const pdf = await pdfjsLib.getDocument({
            url: previewUrl,
            disableAutoFetch: true
        }).promise;
        const page = await pdf.getPage(1);

        const context = canvas.getContext('2d');

        const targetWidth = 260;
        const viewport = page.getViewport({ scale: 1 });
        const scale = targetWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
            canvasContext: context,
            viewport: scaledViewport
        }).promise;

        pdf.destroy();
    } catch (error) {
        console.error('Não foi possível renderizar a miniatura:', error);
    }
}

async function openBook() {
    closePreview();

    readerModal.classList.add('is-open');
    readerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const proc = PROCESSES[state.currentId];
    readerTitle.textContent = proc.title;

    // Mesmo processo já carregado: apenas reabre o leitor
    if (state.pageFlip && state.loadedId === state.currentId) {
        updateCounter();
        return;
    }

    // Outro processo: descarta o livro anterior e zera o zoom
    state.renderToken++;
    if (state.pdf) {
        try { state.pdf.destroy(); } catch (e) { /* ignora */ }
        state.pdf = null;
    }
    if (state.pageFlip) {
        try { state.pageFlip.destroy(); } catch (e) { /* ignora */ }
        state.pageFlip = null;
    }
    if (!document.getElementById('book')) {
        book = document.createElement('div');
        book.id = 'book';
        book.className = 'book';
        bookStage.appendChild(book);
    }
    book.innerHTML = '';
    state.panX = 0;
    state.panY = 0;
    setZoom(1);

    bookLoading.innerHTML = loadingHTML;
    bookLoading.style.display = 'flex';

    try {
        state.pdf = await pdfjsLib.getDocument({
            url: proc.pdf,
            disableAutoFetch: true
        }).promise;
        state.totalPages = state.pdf.numPages;

        await createBookPages();
        createPageFlip();
        await ensurePages(0);
        state.loadedId = state.currentId;

        bookLoading.style.display = 'none';
    } catch (error) {
        console.error(error);
        bookLoading.innerHTML =
            '<p>Não foi possível carregar o processo.</p>';
    }
}

async function createBookPages() {
    book.innerHTML = '';
    state.renderedPages = [];
    state.pageStates = new Array(state.totalPages).fill(null);

    /*
     * Cada página do PDF vira uma "página" do livro, mas aqui só criamos
     * os espaços vazios. O desenho (canvas) é feito sob demanda em
     * ensurePages(), apenas para as páginas próximas da que está aberta.
     * Isso evita travar o computador em processos com muitas páginas.
     */
    const fragment = document.createDocumentFragment();

    for (let pageNumber = 1; pageNumber <= state.totalPages; pageNumber++) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page';
        pageContainer.dataset.pageNumber = pageNumber;

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        pageContainer.appendChild(canvas);
        fragment.appendChild(pageContainer);

        state.renderedPages.push(pageContainer);
    }

    /*
     * Se o total de páginas for ímpar, a última página ficaria sozinha
     * na dupla e o livro se descentraliza ao virá-la. Uma página em
     * branco no final mantém sempre a dupla completa.
     */
    if (state.totalPages % 2 !== 0) {
        const filler = document.createElement('div');
        filler.className = 'page page-filler';
        filler.style.background = '#f8f4e8';
        fragment.appendChild(filler);
    }

    book.appendChild(fragment);
}

async function renderPdfPage(pageNumber, canvas, pdf) {
    const page = await pdf.getPage(pageNumber);

    /*
     * Largura fixa de renderização (em pixels): nítida o bastante para
     * o zoom, sem consumir memória demais por página.
     */
    const targetWidth = 1400;
    const baseViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({
        scale: targetWidth / baseViewport.width
    });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const context = canvas.getContext('2d');

    await page.render({
        canvasContext: context,
        viewport,
        background: '#ffffff'
    }).promise;

    page.cleanup();
}

/*
 * Garante que as páginas ao redor da posição atual estejam desenhadas
 * e libera a memória das páginas que ficaram muito longe.
 */
async function ensurePages(center) {
    const pdf = state.pdf;
    if (!pdf) return;

    const token = ++state.renderToken;
    const last = state.totalPages - 1;
    const from = Math.max(0, center - 2);
    const to = Math.min(last, center + 5);

    state.renderedPages.forEach((container, i) => {
        if (state.pageStates[i] === 'done' &&
            (i < center - 6 || i > center + 9)) {
            const canvas = container.querySelector('canvas');
            canvas.width = 1;
            canvas.height = 1;
            state.pageStates[i] = null;
        }
    });

    const order = [];
    for (let i = from; i <= to; i++) order.push(i);
    order.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));

    for (const i of order) {
        if (token !== state.renderToken || state.pdf !== pdf) return;
        if (state.pageStates[i]) continue;

        state.pageStates[i] = 'loading';

        try {
            const canvas = state.renderedPages[i].querySelector('canvas');
            await renderPdfPage(i + 1, canvas, pdf);
            state.pageStates[i] = state.pdf === pdf ? 'done' : null;
        } catch (error) {
            state.pageStates[i] = null;
            console.error(`Erro ao renderizar a página ${i + 1}:`, error);
        }
    }
}

function createPageFlip() {
    if (state.pageFlip) {
        state.pageFlip.destroy();
    }

    state.pageFlip = new St.PageFlip(book, {
        width: 601,
        height: 934,
        size: 'stretch',
        minWidth: 260,
        maxWidth: 610,
        minHeight: 400,
        maxHeight: 940,
        showCover: false,
        maxShadowOpacity: 0.35,
        mobileScrollSupport: false,
        usePortrait: false,
        flippingTime: 750,
        drawShadow: true,
        startPage: 0,
        autoSize: true,
        clickEventForward: true,
        swipeDistance: 20,
        useMouseEvents: true
    });

    state.pageFlip.loadFromHTML(
        document.querySelectorAll('.book .page')
    );

    state.pageFlip.on('flip', (event) => {
        updateCounter(event.data);
        ensurePages(event.data);
        playPageSound();
    });

    updateCounter(0);
}

function updateCounter(index) {
    if (!state.pageFlip) return;

    const current = typeof index === 'number'
        ? index
        : state.pageFlip.getCurrentPageIndex();

    const first = current + 1;
    const second = Math.min(current + 2, state.totalPages);

    if (state.totalPages === 1 || first === second) {
        pageCounter.textContent = `${first} / ${state.totalPages}`;
    } else {
        pageCounter.textContent =
            `${first}–${second} / ${state.totalPages}`;
    }
}

function goPrevious() {
    if (state.pageFlip) {
        state.pageFlip.flipPrev();
    }
}

function goNext() {
    if (state.pageFlip) {
        state.pageFlip.flipNext();
    }
}

/*
 * Som de virar página (arquivo som/virar_pagina.mp3).
 * Usamos uma cópia do áudio a cada virada para que viradas rápidas
 * não cortem o som anterior.
 */
const pageSound = new Audio('som/virar_pagina.mp3');
pageSound.preload = 'auto';

function playPageSound() {
    try {
        const sound = pageSound.cloneNode();
        sound.volume = 0.8;
        sound.play().catch(error => {
            console.warn('Som de página indisponível:', error);
        });
    } catch (error) {
        console.warn('Som de página indisponível:', error);
    }
}

/*
 * Impede que o livro saia do enquadramento: quando ele é menor que a
 * área de leitura não há deslocamento (fica centralizado); quando está
 * ampliado, só permite mover até as bordas do livro.
 */
function clampPan() {
    const stageWidth = bookStage.clientWidth;
    const stageHeight = bookStage.clientHeight;

    const maxPanX = Math.max(0, (book.offsetWidth * state.zoom - stageWidth) / 2);
    const maxPanY = Math.max(0, (book.offsetHeight * state.zoom - stageHeight) / 2);

    state.panX = Math.max(-maxPanX, Math.min(maxPanX, state.panX));
    state.panY = Math.max(-maxPanY, Math.min(maxPanY, state.panY));
}

function setZoom(value, mouseX = null, mouseY = null) {
    const oldZoom = state.zoom;

    const newZoom = Math.max(.75, Math.min(2.5, value));
    const factor = newZoom / oldZoom;

    if (mouseX !== null && mouseY !== null) {
        // Zoom apontado: mantém o ponto sob o cursor no mesmo lugar
        const rect = bookStage.getBoundingClientRect();

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const pointX = mouseX - rect.left - centerX;
        const pointY = mouseY - rect.top - centerY;

        state.panX = pointX - (pointX - state.panX) * factor;
        state.panY = pointY - (pointY - state.panY) * factor;
    } else {
        // Botões/teclado: amplia/reduz em torno do centro da tela
        state.panX *= factor;
        state.panY *= factor;
    }

    state.zoom = newZoom;

    // Ao reduzir, o livro volta gradualmente para o centro
    clampPan();

    book.style.transform =
        `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;

    zoomValue.textContent =
        `${Math.round(state.zoom * 100)}%`;
}

function changeZoom(amount, mouseX = null, mouseY = null) {
    setZoom(
        state.zoom + amount,
        mouseX,
        mouseY
    );
}

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await readerModal.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.warn('Tela cheia não disponível:', error);
    }
}

function closeReader() {
    readerModal.classList.remove('is-open');
    readerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

function setupSearch() {
    processSearch.addEventListener('input', () => {
        const query = processSearch.value
            .trim()
            .toLowerCase();

        let visible = 0;

        document.querySelectorAll('.process-card').forEach(card => {
            const name = card.dataset.processName.toLowerCase();
            const match = name.includes(query);

            card.style.display = match ? '' : 'none';

            if (match) visible++;
        });

        noResults.hidden = visible !== 0;
    });
}

function setupEvents() {
    document.querySelectorAll('.process-card').forEach(card => {
        card.querySelector('.process-card-button')
            .addEventListener('click', () => openPreview(card.dataset.processId));
    });

    document.getElementById('closePreview')
        .addEventListener('click', closePreview);

    document.querySelector('[data-close="preview"]')
        .addEventListener('click', closePreview);

    document.getElementById('openBook')
        .addEventListener('click', openBook);

    document.getElementById('closeReader')
        .addEventListener('click', closeReader);

    document.getElementById('previousPage')
        .addEventListener('click', goPrevious);

    document.getElementById('nextPage')
        .addEventListener('click', goNext);

    document.getElementById('zoomOut')
        .addEventListener('click', () => changeZoom(-.15));

    document.getElementById('zoomIn')
        .addEventListener('click', () => changeZoom(.15));

    document.getElementById('fullscreenReader')
        .addEventListener('click', toggleFullscreen);

    processSearch.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            processSearch.value = '';
            processSearch.dispatchEvent(new Event('input'));
        }
    });

    document.addEventListener('keydown', event => {
        if (!readerModal.classList.contains('is-open')) return;

        if (event.key === 'ArrowLeft') goPrevious();
        if (event.key === 'ArrowRight') goNext();
        if (event.key === 'Escape') closeReader();
        if (event.key === '+' || event.key === '=') changeZoom(.15);
        if (event.key === '-') changeZoom(-.15);
    });

    /*
     * Scroll do mouse para zoom.
     * No touch, o PageFlip utiliza o gesto de arrastar/swipe.
     */
    bookStage.addEventListener('wheel', event => {
        if (!readerModal.classList.contains('is-open')) return;

        event.preventDefault();

        const zoomAmount = event.deltaY < 0 ? 0.1 : -0.1;

        changeZoom(
            zoomAmount,
            event.clientX,
            event.clientY
        );
}, { passive: false });
}

setupSearch();
setupEvents();
setupPreviewZoom();