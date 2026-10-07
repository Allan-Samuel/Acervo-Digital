/* global pdfjsLib, St */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    window.PDFJS_WORKER_SRC || 'lib/pdf.worker.min.js';

/*
 * Para adicionar um novo processo: inclua uma entrada aqui. O card da tela
 * inicial é criado automaticamente a partir dela (não é preciso mexer no HTML).
 *
 *   title    título mostrado na prévia e no leitor
 *   pdf      processo completo
 *   preview  PDF de apresentação (prévia)
 *   card     dados do card da tela inicial (name = texto usado na pesquisa)
 */
const PROCESSES = {
    'hugo-auler': {
        title: 'Inventário Hugo Auler',
        pdf: 'processos/Processo_de_Inventário_Hugo_Auler.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_inventario_hugo_auler.pdf',
        card: {
            name: "Inventário Hugo Auler",
            thumbnail: "img/logo_inventario_hugo_auler.jpg",
            alt: "Inventário Hugo Auler",
            type: "TESTAMENTO",
            heading: "Inventário Hugo Auler",
            number: "Processo nº 31971/1980"
        }
    },
    'ana-lidia': {
        title: 'Caso Ana Lídia',
        pdf: 'processos/Processo_Ana_Lídia.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_caso_ana_lidia.pdf',
        card: {
            name: "Caso Ana Lídia",
            thumbnail: "img/logo_caso_ana_lidia.jpg",
            alt: "Caso Ana Lídia",
            type: "AÇÃO PENAL",
            heading: "Caso Ana Lídia",
            number: "Processo nº A0001948/1985 (00000549/74)"
        }
    },
    'oscar-niemeyer': {
        title: 'Caso Oscar Niemeyer',
        pdf: 'processos/Processo_Oscar_Niemeyer.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_caso_oscar_niemeyer.pdf',
        card: {
            name: "Oscar Niemeyer",
            thumbnail: "img/logo_oscar_niemeyer.jpg",
            alt: "Oscar Niemeyer",
            type: "AÇÃO PENAL",
            heading: "Caso Oscar Niemeyer",
            number: "Processo nº 24371/1965"
        }
    },
    'dois-candangos': {
        title: 'Dois Candangos',
        pdf: 'processos/Processo_Dois_Candangos.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_dois_candangos.pdf',
        card: {
            name: "Dois Candangos",
            thumbnail: "img/logo_dois_candangos.jpg",
            alt: "Dois Candangos",
            type: "ACIDENTE DE TRABALHO – 3/4/1962",
            heading: "Dois Candangos",
            number: "Processo nº S3066/62"
        }
    },
    'caixa-dagua': {
        title: "Demolição da Caixa d'Água de Taguatinga",
        pdf: 'processos/Processo_Caixa_Dagua.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_caso_caixa_dagua.pdf',
        card: {
            name: "Caso Caixa d'Água",
            thumbnail: "img/logo_caixa_dagua.jpg",
            alt: "Caso Caixa d'Água",
            type: "AÇÃO POPULAR",
            heading: "Demolição da Caixa d'Água de Taguatinga",
            number: "Processo nº 15.429/1981 e 2.185/1981"
        }
    },
    'crime-passional': {
        title: 'Caso Hipótese de Crime Passional',
        pdf: 'processos/Processo_Crime_Passional.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_crime_passional_em_1959.pdf',
        card: {
            name: "Crime Passional em 1959",
            thumbnail: "img/logo_crime_passional.jpg",
            alt: "Crime Passional em 1959",
            type: "AÇÃO PENAL",
            heading: "Caso Hipótese de Crime Passional",
            number: "Processo nº 590/1960"
        }
    },
    'arnon-de-mello': {
        title: 'Caso Arnon de Mello',
        pdf: 'processos/Processo_Arnon_de_Mello.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_caso_arnon_de_mello.pdf',
        card: {
            name: "Caso Arnon de Mello",
            thumbnail: "img/logo_arnon_de_mello.jpg",
            alt: "Caso Arnon de Mello",
            type: "AÇÃO PENAL",
            heading: "Caso Arnon de Mello",
            number: "Processo nº 967/1963"
        }
    },
    'darcy-ribeiro': {
        title: 'Caso Darcy Ribeiro',
        pdf: 'processos/Processo_Darcy_Ribeiro.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_darcy_ribeiro.pdf',
        card: {
            name: "Darcy Ribeiro",
            thumbnail: "img/logo_darcy_ribeiro.jpg",
            alt: "Darcy Ribeiro",
            type: "QUEIXA-CRIME (AÇÃO PENAL PRIVADA)",
            heading: "Caso Darcy Ribeiro",
            number: "Processo nº 23278/80"
        }
    },
    'roubo-diamante': {
        title: 'Pressuposto Roubo do Diamante 007 em 1965',
        pdf: 'processos/Processo_Roubo_Diamante.pdf',
        preview: 'previa_processos/PROCESSOS_HISTORICOS_diamante_007.pdf',
        card: {
            name: "Roubo do Diamante",
            thumbnail: "img/logo_roubo_diamante.jpg",
            alt: "Roubo do Diamante",
            type: "AÇÃO PENAL",
            heading: "Pressuposto Roubo do Diamante 007 em 1965",
            number: "Processo nº 1734/66 - S001736/84"
        }
    }
};

/*
 * Quiosque: volta sozinho para a tela inicial depois deste tempo sem
 * nenhum toque, clique ou tecla (em milissegundos; 0 desativa).
 */
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;

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

let thumbnailToken = 0;

async function renderPreviewThumbnail(previewUrl) {
    const token = ++thumbnailToken;
    const miniPage = document.querySelector('.mini-page');
    const canvas = document.getElementById('previewPageCanvas');

    // Mostra o círculo de carregamento até a miniatura ficar pronta
    miniPage.classList.remove('is-error');
    miniPage.classList.add('is-loading');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    try {
        // Miniatura = 1ª página do processo completo. disableAutoFetch evita
        // baixar o PDF inteiro só para desenhar a primeira página.
        const pdf = await pdfjsLib.getDocument({
            url: previewUrl,
            disableAutoFetch: true
        }).promise;
        const page = await pdf.getPage(1);

        // Outro processo foi aberto enquanto este carregava: descarta
        if (token !== thumbnailToken) {
            pdf.destroy();
            return;
        }

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

        if (token === thumbnailToken) {
            miniPage.classList.remove('is-loading');
        }
    } catch (error) {
        console.error('Não foi possível renderizar a miniatura:', error);

        if (token === thumbnailToken) {
            miniPage.classList.remove('is-loading');
            miniPage.classList.add('is-error');
        }
    }
}

/* Libera o livro atual (PDF, páginas desenhadas e PageFlip) e zera o zoom */
function disposeBook() {
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
    state.loadedId = null;
    state.panX = 0;
    state.panY = 0;
    setZoom(1);
}

async function openBook() {
    // Dentro do clique do usuário: entra em tela cheia automaticamente
    enterFullscreen();

    closePreview();

    readerModal.classList.add('is-open');
    readerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const proc = PROCESSES[state.currentId];
    readerTitle.textContent = proc.title;
    updateProcessNav();

    // Cada abertura começa sem zoom
    state.panX = 0;
    state.panY = 0;
    setZoom(1);

    // Mesmo processo já carregado: apenas reabre o leitor
    if (state.pageFlip && state.loadedId === state.currentId) {
        updateCounter();
        return;
    }

    // Outro processo: descarta o livro anterior
    disposeBook();

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
    const targetWidth = 1800;
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
        maxWidth: 2400,
        minHeight: 400,
        maxHeight: 3600,
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
 * Sons de virar página: alternam em sequência a cada virada.
 * Usamos uma cópia do áudio a cada toque para que viradas rápidas
 * não cortem o som anterior.
 */
const PAGE_SOUNDS = [
    'som/virar_pagina.mp3',
    'som/virar_pagina_dois.mp3'
].map(src => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    return audio;
});

let pageSoundIndex = 0;

function playPageSound() {
    try {
        const sound = PAGE_SOUNDS[pageSoundIndex].cloneNode();
        pageSoundIndex = (pageSoundIndex + 1) % PAGE_SOUNDS.length;

        sound.volume = 0.8;
        sound.play().catch(error => {
            console.warn('Som de página indisponível:', error);
        });
    } catch (error) {
        console.warn('Som de página indisponível:', error);
    }
}

const PAGE_W = 601;
const PAGE_H = 934;
const MIN_ZOOM = .75;
const MAX_ZOOM = 3;

/*
 * Impede que o livro saia do enquadramento: quando ele cabe na área de
 * leitura não há deslocamento (fica centralizado); quando está ampliado,
 * só permite mover até as bordas das páginas.
 */
function clampPan() {
    const stageWidth = bookStage.clientWidth;
    const stageHeight = bookStage.clientHeight;

    // Tamanho real da dupla de páginas dentro do contêiner
    const ratio = (2 * PAGE_W) / PAGE_H;
    const contentHeight = Math.min(book.offsetHeight, book.offsetWidth / ratio);
    const contentWidth = contentHeight * ratio;

    const maxPanX = Math.max(0, (contentWidth * state.zoom - stageWidth) / 2);
    const maxPanY = Math.max(0, (contentHeight * state.zoom - stageHeight) / 2);

    state.panX = Math.max(-maxPanX, Math.min(maxPanX, state.panX));
    state.panY = Math.max(-maxPanY, Math.min(maxPanY, state.panY));
}

function applyTransform() {
    clampPan();

    book.style.transform =
        `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;

    zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;

    // Ampliado: arrastar move a página (não vira). Virar: setas/teclado.
    const zoomed = state.zoom > 1.02;
    book.style.pointerEvents = zoomed ? 'none' : '';
    bookStage.classList.toggle('is-zoomed', zoomed);
}

function setZoom(value, pointX = null, pointY = null) {
    const oldZoom = state.zoom;

    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    const factor = newZoom / oldZoom;

    if (pointX !== null && pointY !== null) {
        // Zoom apontado: mantém o ponto sob o cursor/dedos no mesmo lugar
        const rect = bookStage.getBoundingClientRect();

        const relX = pointX - rect.left - rect.width / 2;
        const relY = pointY - rect.top - rect.height / 2;

        state.panX = relX - (relX - state.panX) * factor;
        state.panY = relY - (relY - state.panY) * factor;
    } else {
        // Botões/teclado: amplia/reduz em torno do centro da tela
        state.panX *= factor;
        state.panY *= factor;
    }

    state.zoom = newZoom;
    applyTransform();
}

function changeZoom(amount, mouseX = null, mouseY = null) {
    setZoom(
        state.zoom + amount,
        mouseX,
        mouseY
    );
}

/* Tela cheia da página inteira (equivale ao F11) */
async function enterFullscreen() {
    try {
        const root = document.documentElement;
        if (!document.fullscreenElement && root.requestFullscreen) {
            await root.requestFullscreen();
        }
    } catch (error) {
        console.warn('Tela cheia não disponível:', error);
    }
}

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.warn('Tela cheia não disponível:', error);
    }
}

function hideReader() {
    readerModal.classList.remove('is-open');
    readerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* Processos na ordem e com os filtros/pesquisa aplicados na landing page */
function getNavIds() {
    const ids = [...document.querySelectorAll('.process-card')]
        .filter(card => card.style.display !== 'none')
        .map(card => card.dataset.processId)
        .filter(id => PROCESSES[id]);

    return ids.includes(state.currentId) ? ids : Object.keys(PROCESSES);
}

/* Mostra o nome do processo anterior/próximo nos botões do topo */
function updateProcessNav() {
    const ids = getNavIds();
    const index = ids.indexOf(state.currentId);
    const prev = PROCESSES[ids[(index - 1 + ids.length) % ids.length]].title;
    const next = PROCESSES[ids[(index + 1) % ids.length]].title;

    // Só um processo no filtro: não há para onde navegar
    const visibility = ids.length > 1 ? '' : 'hidden';
    document.getElementById('prevProcess').style.visibility = visibility;
    document.getElementById('nextProcess').style.visibility = visibility;

    document.getElementById('prevProcessLabel').textContent = prev;
    document.getElementById('nextProcessLabel').textContent = next;
    document.getElementById('prevProcess').title = prev;
    document.getElementById('prevProcess').setAttribute('aria-label', prev);
    document.getElementById('nextProcess').title = next;
    document.getElementById('nextProcess').setAttribute('aria-label', next);
}

/* X: fecha o leitor e volta para a prévia do mesmo processo */
function closeReader() {
    hideReader();
    openPreview(state.currentId);
}

/* Setas do topo: abre a prévia do processo anterior (-1) ou seguinte (+1) */
function goToProcess(step) {
    const ids = getNavIds();
    const index = ids.indexOf(state.currentId);
    const target = ids[(index + step + ids.length) % ids.length];

    hideReader();
    openPreview(target);
}

/* Filtro: ordem cronológica (ano lido do nº do processo) e tipo (1º título do card) */
const filterState = { order: '', type: '' };

function getCardMeta(card) {
    const type = (card.querySelector('.process-type')?.textContent || '').split('–')[0].trim();
    const number = card.querySelector('.process-card-info p:not(.process-type)')?.textContent || '';
    const match = number.match(/\/\s*(\d{2,4})/);
    let year = match ? parseInt(match[1], 10) : null;
    if (match && match[1].length === 2) year += 1900;
    return { type, year };
}

function applyFilters() {
    const grid = document.getElementById('processGrid');
    const query = processSearch.value.trim().toLowerCase();
    const cards = [...grid.querySelectorAll('.process-card')];

    cards.sort((a, b) => {
        const ya = a.dataset.year;
        const yb = b.dataset.year;

        if (filterState.order) {
            if (ya && yb && ya !== yb) return filterState.order === 'asc' ? ya - yb : yb - ya;
            if (!ya !== !yb) return ya ? -1 : 1;
        }
        return a.dataset.index - b.dataset.index;
    });

    let visible = 0;

    cards.forEach(card => {
        grid.appendChild(card);

        const matchName = card.dataset.processName.toLowerCase().includes(query);
        const matchType = !filterState.type || card.dataset.type === filterState.type;
        const match = matchName && matchType;

        card.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    noResults.hidden = visible !== 0;

    document.querySelectorAll('.filter-option').forEach(option => {
        const selected = option.dataset.order
            ? option.dataset.order === filterState.order
            : option.dataset.type === filterState.type;
        option.classList.toggle('is-selected', selected);
    });

    const active = Boolean(filterState.order || filterState.type);
    document.getElementById('filterToggle').classList.toggle('is-active', active);
    document.getElementById('filterClear').hidden = !active;
}

function setupSearch() {
    processSearch.addEventListener('input', applyFilters);
}

function setupFilter() {
    const toggle = document.getElementById('filterToggle');
    const menu = document.getElementById('filterMenu');
    const typeBox = document.getElementById('filterTypeOptions');
    const cards = [...document.querySelectorAll('.process-card')];

    cards.forEach((card, index) => {
        const { type, year } = getCardMeta(card);
        card.dataset.index = index;
        card.dataset.type = type;
        if (year) card.dataset.year = year;
    });

    [...new Set(cards.map(card => card.dataset.type).filter(Boolean))].forEach(type => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'filter-option';
        option.dataset.type = type;
        option.textContent = type;
        typeBox.appendChild(option);
    });

    const closeMenu = () => {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', event => {
        event.stopPropagation();
        menu.hidden = !menu.hidden;
        toggle.setAttribute('aria-expanded', String(!menu.hidden));
    });

    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });

    menu.addEventListener('click', event => {
        event.stopPropagation();

        const topic = event.target.closest('.filter-topic');
        if (topic) {
            const options = topic.nextElementSibling;
            options.hidden = !options.hidden;
            topic.setAttribute('aria-expanded', String(!options.hidden));
            return;
        }

        const option = event.target.closest('.filter-option');
        if (!option) return;

        if (option.dataset.order) {
            filterState.order = filterState.order === option.dataset.order ? '' : option.dataset.order;
        } else {
            filterState.type = filterState.type === option.dataset.type ? '' : option.dataset.type;
        }
        applyFilters();
    });

    document.getElementById('filterClear').addEventListener('click', () => {
        filterState.order = '';
        filterState.type = '';
        applyFilters();
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

    document.getElementById('goHome')
        .addEventListener('click', hideReader);

    document.getElementById('prevProcess')
        .addEventListener('click', () => goToProcess(-1));

    document.getElementById('nextProcess')
        .addEventListener('click', () => goToProcess(1));

    document.getElementById('previousPage')
        .addEventListener('click', goPrevious);

    document.getElementById('nextPage')
        .addEventListener('click', goNext);

    document.getElementById('zoomOut')
        .addEventListener('click', () => changeZoom(-.15));

    document.getElementById('zoomIn')
        .addEventListener('click', () => changeZoom(.15));

    const fullscreenButton = document.getElementById('pageFullscreen');
    if (document.documentElement.requestFullscreen) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    } else {
        fullscreenButton.hidden = true;
    }

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

/*
 * Gestos no leitor.
 * Toque: dois dedos = zoom (pinça); um dedo com zoom = mover a página;
 * um dedo sem zoom = arrastar para folhear/virar a página (o toque é
 * repassado ao PageFlip como se fosse o mouse).
 * Mouse: arrastar com zoom = mover a página (sem zoom o PageFlip vira
 * a página arrastando, como antes).
 */
function setupReaderGestures() {
    const touch = {
        mode: null, startX: 0, startY: 0, panX: 0, panY: 0,
        dist: 0, zoom: 1, midX: 0, midY: 0, wasPinch: false,
        flipping: false, target: null, lastX: 0, lastY: 0
    };

    // Reproduz o mouse para o PageFlip (ele já faz o efeito de folhear)
    function fireMouse(type, x, y) {
        let target = touch.target;
        if (!target || !book.contains(target)) {
            target = book.querySelector('.stf__wrapper') || book;
        }
        target.dispatchEvent(new MouseEvent(type, {
            bubbles: true, cancelable: true, view: window, button: 0,
            buttons: type === 'mouseup' ? 0 : 1, clientX: x, clientY: y
        }));
    }

    const distance = t => Math.hypot(
        t[0].clientX - t[1].clientX,
        t[0].clientY - t[1].clientY
    );
    const midpoint = t => ({
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2
    });

    function startSingle(t) {
        touch.mode = 'single';
        touch.flipping = false;
        touch.target = t.target;
        touch.startX = t.clientX;
        touch.startY = t.clientY;
        touch.panX = state.panX;
        touch.panY = state.panY;
    }

    function onTouchStart(event) {
        if (!readerModal.classList.contains('is-open')) return;

        // Impede o PageFlip e o navegador de tratarem este toque
        event.preventDefault();
        event.stopPropagation();

        bookStage.classList.add('is-gesturing');

        const t = event.touches;

        if (t.length >= 2) {
            // Segundo dedo: encerra o arrasto de página que estava em andamento
            if (touch.flipping) {
                fireMouse('mouseup', touch.lastX, touch.lastY);
                touch.flipping = false;
            }

            const mid = midpoint(t);
            touch.mode = 'pinch';
            touch.wasPinch = true;
            touch.dist = distance(t);
            touch.zoom = state.zoom;
            touch.midX = mid.x;
            touch.midY = mid.y;
        } else {
            touch.wasPinch = false;
            startSingle(t[0]);
        }
    }

    function onTouchMove(event) {
        if (!touch.mode) return;

        event.preventDefault();
        event.stopPropagation();

        const t = event.touches;

        if (touch.mode === 'pinch' && t.length >= 2) {
            const mid = midpoint(t);

            setZoom(touch.zoom * (distance(t) / touch.dist), mid.x, mid.y);

            // Acompanha o movimento dos dedos durante a pinça
            state.panX += mid.x - touch.midX;
            state.panY += mid.y - touch.midY;
            touch.midX = mid.x;
            touch.midY = mid.y;
            applyTransform();
        } else if (touch.mode === 'single' && t.length === 1 && state.zoom > 1.02) {
            state.panX = touch.panX + (t[0].clientX - touch.startX);
            state.panY = touch.panY + (t[0].clientY - touch.startY);
            applyTransform();
        } else if (touch.mode === 'single' && t.length === 1 && !touch.wasPinch) {
            // Sem zoom: o dedo arrasta a página como o mouse
            const x = t[0].clientX;
            const y = t[0].clientY;

            if (!touch.flipping) {
                if (Math.hypot(x - touch.startX, y - touch.startY) < 6) return;
                touch.flipping = true;
                fireMouse('mousedown', touch.startX, touch.startY);
            }

            touch.lastX = x;
            touch.lastY = y;
            fireMouse('mousemove', x, y);
        }
    }

    function onTouchEnd(event) {
        if (!touch.mode) return;

        event.preventDefault();
        event.stopPropagation();

        const remaining = event.touches;

        // Soltou o dedo: o PageFlip decide se a página vira ou volta
        if (touch.flipping && event.changedTouches.length) {
            const c = event.changedTouches[0];
            fireMouse('mouseup', c.clientX, c.clientY);
            touch.flipping = false;
        }

        if (remaining.length === 0) {
            touch.mode = null;
            bookStage.classList.remove('is-gesturing');

            // Perto de 100%: volta exatamente a 100%, centralizado
            if (Math.abs(state.zoom - 1) < .05) {
                setZoom(1);
            }
        } else if (remaining.length === 1) {
            // Soltou um dos dedos da pinça: continua movendo com o outro
            startSingle(remaining[0]);
        }
    }

    const options = { passive: false, capture: true };
    bookStage.addEventListener('touchstart', onTouchStart, options);
    bookStage.addEventListener('touchmove', onTouchMove, options);
    bookStage.addEventListener('touchend', onTouchEnd, options);
    bookStage.addEventListener('touchcancel', onTouchEnd, options);

    // Mouse: arrastar para mover a página ampliada
    let mousePan = null;

    bookStage.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        if (state.zoom <= 1.02) return;

        mousePan = {
            x: event.clientX,
            y: event.clientY,
            panX: state.panX,
            panY: state.panY
        };

        bookStage.setPointerCapture(event.pointerId);
        bookStage.classList.add('is-gesturing');
    });

    bookStage.addEventListener('pointermove', event => {
        if (!mousePan) return;

        state.panX = mousePan.panX + (event.clientX - mousePan.x);
        state.panY = mousePan.panY + (event.clientY - mousePan.y);
        applyTransform();
    });

    const endMousePan = () => {
        mousePan = null;
        bookStage.classList.remove('is-gesturing');
    };

    bookStage.addEventListener('pointerup', endMousePan);
    bookStage.addEventListener('pointercancel', endMousePan);
}

/* Cria os cards da tela inicial a partir de PROCESSES */
function renderCards() {
    const grid = document.getElementById('processGrid');
    grid.innerHTML = '';

    Object.entries(PROCESSES).forEach(([id, proc]) => {
        const { card } = proc;

        const article = document.createElement('article');
        article.className = 'process-card';
        article.dataset.processName = card.name;
        article.dataset.processId = id;

        article.innerHTML = `
            <button class="process-card-button" type="button">
                <div class="process-thumbnail-wrap">
                    <img class="process-thumbnail" alt="">
                    <div class="open-overlay">ABRIR PROCESSO</div>
                </div>

                <div class="process-card-info">
                    <p class="process-type"></p>
                    <h3></h3>
                    <p></p>
                </div>
            </button>`;

        const image = article.querySelector('.process-thumbnail');
        image.src = card.thumbnail;
        image.alt = card.alt;

        article.querySelector('.process-type').textContent = card.type;
        article.querySelector('h3').textContent = card.heading;
        article.querySelector('.process-card-info p:last-child').textContent = card.number;

        grid.appendChild(article);
    });
}

/* Volta ao estado inicial: fecha prévia/leitor, limpa busca e filtros, libera memória */
function resetToHome() {
    hideReader();
    closePreview();

    document.getElementById('filterMenu').hidden = true;
    document.getElementById('filterToggle').setAttribute('aria-expanded', 'false');

    processSearch.value = '';
    filterState.order = '';
    filterState.type = '';
    applyFilters();

    disposeBook();
    state.currentId = null;

    window.scrollTo(0, 0);
}

/* Quiosque: depois de um tempo sem uso, prepara a tela para o próximo visitante */
function setupIdleReset() {
    if (!IDLE_TIMEOUT_MS) return;

    let timer = null;
    let lastActivity = 0;

    const somethingToReset = () =>
        previewModal.classList.contains('is-open') ||
        readerModal.classList.contains('is-open') ||
        processSearch.value !== '' ||
        filterState.order !== '' ||
        filterState.type !== '' ||
        window.scrollY > 0;

    const schedule = () => {
        const now = Date.now();
        if (timer && now - lastActivity < 1000) return;   // evita reagendar a cada pixel
        lastActivity = now;

        clearTimeout(timer);
        timer = setTimeout(() => {
            if (somethingToReset()) resetToHome();
        }, IDLE_TIMEOUT_MS);
    };

    // Captura: enxerga também os toques que o leitor interrompe (stopPropagation)
    ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach(type => {
        document.addEventListener(type, schedule, { passive: true, capture: true });
    });

    schedule();
}

renderCards();
setupSearch();
setupFilter();
setupEvents();
setupPreviewZoom();
setupReaderGestures();
setupIdleReset();