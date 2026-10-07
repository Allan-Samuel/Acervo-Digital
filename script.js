/* global pdfjsLib, St */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    window.CAMINHO_WORKER_PDFJS || 'lib/pdf.worker.min.js';

/*
 * Para adicionar um novo processo: inclua uma entrada aqui. O card da tela
 * inicial é criado automaticamente a partir dela (não é preciso mexer no HTML).
 *
 *   titulo   título mostrado na prévia e no leitor
 *   pdf      processo completo
 *   previa   PDF de apresentação (prévia)
 *   cartao   dados do card da tela inicial (nome = texto usado na pesquisa)
 */
const PROCESSOS = {
    'hugo-auler': {
        titulo: 'Inventário Hugo Auler',
        pdf: 'processos/Processo_de_Inventário_Hugo_Auler.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_inventario_hugo_auler.pdf',
        cartao: {
            nome: "Inventário Hugo Auler",
            miniatura: "img/logo_inventario_hugo_auler.jpg",
            alt: "Inventário Hugo Auler",
            tipo: "TESTAMENTO",
            cabecalho: "Inventário Hugo Auler",
            numero: "Processo nº 31971/1980"
        }
    },
    'ana-lidia': {
        titulo: 'Caso Ana Lídia',
        pdf: 'processos/Processo_Ana_Lídia.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_caso_ana_lidia.pdf',
        cartao: {
            nome: "Caso Ana Lídia",
            miniatura: "img/logo_caso_ana_lidia.jpg",
            alt: "Caso Ana Lídia",
            tipo: "AÇÃO PENAL",
            cabecalho: "Caso Ana Lídia",
            numero: "Processo nº A0001948/1985 (00000549/74)"
        }
    },
    'oscar-niemeyer': {
        titulo: 'Caso Oscar Niemeyer',
        pdf: 'processos/Processo_Oscar_Niemeyer.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_caso_oscar_niemeyer.pdf',
        cartao: {
            nome: "Oscar Niemeyer",
            miniatura: "img/logo_oscar_niemeyer.jpg",
            alt: "Oscar Niemeyer",
            tipo: "AÇÃO PENAL",
            cabecalho: "Caso Oscar Niemeyer",
            numero: "Processo nº 24371/1965"
        }
    },
    'dois-candangos': {
        titulo: 'Dois Candangos',
        pdf: 'processos/Processo_Dois_Candangos.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_dois_candangos.pdf',
        cartao: {
            nome: "Dois Candangos",
            miniatura: "img/logo_dois_candangos.jpg",
            alt: "Dois Candangos",
            tipo: "ACIDENTE DE TRABALHO – 3/4/1962",
            cabecalho: "Dois Candangos",
            numero: "Processo nº S3066/62"
        }
    },
    'caixa-dagua': {
        titulo: "Demolição da Caixa d'Água de Taguatinga",
        pdf: 'processos/Processo_Caixa_Dagua.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_caso_caixa_dagua.pdf',
        cartao: {
            nome: "Caso Caixa d'Água",
            miniatura: "img/logo_caixa_dagua.jpg",
            alt: "Caso Caixa d'Água",
            tipo: "AÇÃO POPULAR",
            cabecalho: "Demolição da Caixa d'Água de Taguatinga",
            numero: "Processo nº 15.429/1981 e 2.185/1981"
        }
    },
    'crime-passional': {
        titulo: 'Caso Hipótese de Crime Passional',
        pdf: 'processos/Processo_Crime_Passional.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_crime_passional_em_1959.pdf',
        cartao: {
            nome: "Crime Passional em 1959",
            miniatura: "img/logo_crime_passional.jpg",
            alt: "Crime Passional em 1959",
            tipo: "AÇÃO PENAL",
            cabecalho: "Caso Hipótese de Crime Passional",
            numero: "Processo nº 590/1960"
        }
    },
    'arnon-de-mello': {
        titulo: 'Caso Arnon de Mello',
        pdf: 'processos/Processo_Arnon_de_Mello.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_caso_arnon_de_mello.pdf',
        cartao: {
            nome: "Caso Arnon de Mello",
            miniatura: "img/logo_arnon_de_mello.jpg",
            alt: "Caso Arnon de Mello",
            tipo: "AÇÃO PENAL",
            cabecalho: "Caso Arnon de Mello",
            numero: "Processo nº 967/1963"
        }
    },
    'darcy-ribeiro': {
        titulo: 'Caso Darcy Ribeiro',
        pdf: 'processos/Processo_Darcy_Ribeiro.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_darcy_ribeiro.pdf',
        cartao: {
            nome: "Darcy Ribeiro",
            miniatura: "img/logo_darcy_ribeiro.jpg",
            alt: "Darcy Ribeiro",
            tipo: "QUEIXA-CRIME (AÇÃO PENAL PRIVADA)",
            cabecalho: "Caso Darcy Ribeiro",
            numero: "Processo nº 23278/80"
        }
    },
    'roubo-diamante': {
        titulo: 'Pressuposto Roubo do Diamante 007 em 1965',
        pdf: 'processos/Processo_Roubo_Diamante.pdf',
        previa: 'previa_processos/PROCESSOS_HISTORICOS_diamante_007.pdf',
        cartao: {
            nome: "Roubo do Diamante",
            miniatura: "img/logo_roubo_diamante.jpg",
            alt: "Roubo do Diamante",
            tipo: "AÇÃO PENAL",
            cabecalho: "Pressuposto Roubo do Diamante 007 em 1965",
            numero: "Processo nº 1734/66 - S001736/84"
        }
    }
};

/*
 * Quiosque: volta sozinho para a tela inicial depois deste tempo sem
 * nenhum toque, clique ou tecla (em milissegundos; 0 desativa).
 */
const TEMPO_OCIOSO_MS = 3 * 60 * 1000;

const estado = {
    pdf: null,
    pageFlip: null,
    zoom: 1,
    deslocX: 0,
    deslocY: 0,
    paginasRenderizadas: [],
    totalPaginas: 0,
    idAtual: null,
    idCarregado: null,
    estadosPaginas: [],
    tokenRenderizacao: 0
};

const modalPrevia = document.getElementById('modalPrevia');
const modalLeitor = document.getElementById('modalLeitor');
let livro = document.getElementById('livro');
const palcoLivro = document.getElementById('palcoLivro');
const carregandoLivro = document.getElementById('carregandoLivro');
const contadorPaginas = document.getElementById('contadorPaginas');
const valorZoom = document.getElementById('valorZoom');
const areaPrevia = document.getElementById('previaAreaVisivel');
const paginasPrevia = document.getElementById('previaPaginas');
const valorZoomPrevia = document.getElementById('previaValorZoom');
const tituloPrevia = document.getElementById('tituloPrevia');
const tituloLeitor = document.getElementById('tituloLeitor');
const htmlCarregando = carregandoLivro.innerHTML;

const buscaProcesso = document.getElementById('buscaProcesso');
const semResultados = document.getElementById('semResultados');

function abrirPrevia(idProcesso) {
    const processo = PROCESSOS[idProcesso];
    if (!processo) return;

    estado.idAtual = idProcesso;

    tituloPrevia.textContent = processo.titulo;

    modalPrevia.classList.add('esta-aberto');
    modalPrevia.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    definirZoomPrevia(1);
    areaPrevia.scrollTop = 0;
    areaPrevia.scrollLeft = 0;

    renderizarPaginasPrevia(processo.previa);
    renderizarMiniaturaPrevia(processo.pdf);
}

/*
 * Prévia com zoom: as páginas do PDF de apresentação são desenhadas em
 * canvas (em vez de um iframe), para permitir zoom in/out apontando
 * para o ponto desejado.
 */
const estadoPrevia = { zoom: 1, token: 0, pdf: null };

async function renderizarPaginasPrevia(url) {
    const token = ++estadoPrevia.token;

    if (estadoPrevia.pdf) {
        try { estadoPrevia.pdf.destroy(); } catch (e) { /* ignora */ }
        estadoPrevia.pdf = null;
    }

    paginasPrevia.innerHTML = '<p class="previa-carregando">Carregando prévia...</p>';

    try {
        const pdf = await pdfjsLib.getDocument(url).promise;

        if (token !== estadoPrevia.token) {
            pdf.destroy();
            return;
        }

        estadoPrevia.pdf = pdf;
        paginasPrevia.innerHTML = '';

        for (let n = 1; n <= pdf.numPages; n++) {
            const pagina = await pdf.getPage(n);
            if (token !== estadoPrevia.token) return;

            const viewportBase = pagina.getViewport({ scale: 1 });
            const viewport = pagina.getViewport({
                scale: 1800 / viewportBase.width
            });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            paginasPrevia.appendChild(canvas);

            await pagina.render({
                canvasContext: canvas.getContext('2d'),
                viewport,
                background: '#ffffff'
            }).promise;

            pagina.cleanup();
        }
    } catch (erro) {
        if (token !== estadoPrevia.token) return;
        console.error('Não foi possível renderizar a prévia:', erro);
        paginasPrevia.innerHTML =
            '<p class="previa-carregando">Não foi possível carregar a prévia.</p>';
    }
}

function definirZoomPrevia(valor, cliqueX = null, cliqueY = null) {
    const novoZoom = Math.max(.5, Math.min(3, valor));

    const retangulo = areaPrevia.getBoundingClientRect();
    const mx = cliqueX === null ? retangulo.width / 2 : cliqueX - retangulo.left;
    const my = cliqueY === null ? retangulo.height / 2 : cliqueY - retangulo.top;

    // Proporção do conteúdo que está sob o ponto apontado
    const larguraAnterior = paginasPrevia.offsetWidth;
    const alturaAnterior = paginasPrevia.offsetHeight;
    const proporcaoX = larguraAnterior
        ? (areaPrevia.scrollLeft + mx - paginasPrevia.offsetLeft) / larguraAnterior
        : 0.5;
    const proporcaoY = alturaAnterior
        ? (areaPrevia.scrollTop + my - paginasPrevia.offsetTop) / alturaAnterior
        : 0;

    estadoPrevia.zoom = novoZoom;
    paginasPrevia.style.width = `${novoZoom * 100}%`;
    valorZoomPrevia.textContent = `${Math.round(novoZoom * 100)}%`;

    // Mantém o ponto apontado no mesmo lugar da tela
    areaPrevia.scrollLeft =
        proporcaoX * paginasPrevia.offsetWidth + paginasPrevia.offsetLeft - mx;
    areaPrevia.scrollTop =
        proporcaoY * paginasPrevia.offsetHeight + paginasPrevia.offsetTop - my;
}

function configurarZoomPrevia() {
    document.getElementById('previaAumentarZoom')
        .addEventListener('click', () => definirZoomPrevia(estadoPrevia.zoom + .25));

    document.getElementById('previaDiminuirZoom')
        .addEventListener('click', () => definirZoomPrevia(estadoPrevia.zoom - .25));

    document.getElementById('previaRedefinirZoom')
        .addEventListener('click', () => definirZoomPrevia(1));

    // Ctrl + roda do mouse (ou pinça no trackpad) = zoom no ponto apontado
    areaPrevia.addEventListener('wheel', evento => {
        if (!evento.ctrlKey) return;

        evento.preventDefault();

        const passo = evento.deltaY < 0 ? .15 : -.15;
        definirZoomPrevia(estadoPrevia.zoom + passo, evento.clientX, evento.clientY);
    }, { passive: false });

    // Arrastar com o mouse para mover a página ampliada
    let arraste = null;

    areaPrevia.addEventListener('pointerdown', evento => {
        if (evento.pointerType !== 'mouse' || evento.button !== 0) return;

        arraste = {
            x: evento.clientX,
            y: evento.clientY,
            esquerda: areaPrevia.scrollLeft,
            topo: areaPrevia.scrollTop
        };

        areaPrevia.classList.add('esta-arrastando');
        areaPrevia.setPointerCapture(evento.pointerId);
    });

    areaPrevia.addEventListener('pointermove', evento => {
        if (!arraste) return;

        areaPrevia.scrollLeft = arraste.esquerda - (evento.clientX - arraste.x);
        areaPrevia.scrollTop = arraste.topo - (evento.clientY - arraste.y);
    });

    const terminarArraste = () => {
        arraste = null;
        areaPrevia.classList.remove('esta-arrastando');
    };

    areaPrevia.addEventListener('pointerup', terminarArraste);
    areaPrevia.addEventListener('pointercancel', terminarArraste);
}

function fecharPrevia() {
    modalPrevia.classList.remove('esta-aberto');
    modalPrevia.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

let tokenMiniatura = 0;

async function renderizarMiniaturaPrevia(urlPrevia) {
    const token = ++tokenMiniatura;
    const miniPagina = document.querySelector('.mini-pagina');
    const canvas = document.getElementById('previaCanvasPagina');

    // Mostra o círculo de carregamento até a miniatura ficar pronta
    miniPagina.classList.remove('tem-erro');
    miniPagina.classList.add('esta-carregando');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    try {
        // Miniatura = 1ª página do processo completo. disableAutoFetch evita
        // baixar o PDF inteiro só para desenhar a primeira página.
        const pdf = await pdfjsLib.getDocument({
            url: urlPrevia,
            disableAutoFetch: true
        }).promise;
        const pagina = await pdf.getPage(1);

        // Outro processo foi aberto enquanto este carregava: descarta
        if (token !== tokenMiniatura) {
            pdf.destroy();
            return;
        }

        const contexto = canvas.getContext('2d');

        const larguraAlvo = 260;
        const viewport = pagina.getViewport({ scale: 1 });
        const escala = larguraAlvo / viewport.width;
        const viewportEscalado = pagina.getViewport({ scale: escala });

        canvas.width = viewportEscalado.width;
        canvas.height = viewportEscalado.height;

        await pagina.render({
            canvasContext: contexto,
            viewport: viewportEscalado
        }).promise;

        pdf.destroy();

        if (token === tokenMiniatura) {
            miniPagina.classList.remove('esta-carregando');
        }
    } catch (erro) {
        console.error('Não foi possível renderizar a miniatura:', erro);

        if (token === tokenMiniatura) {
            miniPagina.classList.remove('esta-carregando');
            miniPagina.classList.add('tem-erro');
        }
    }
}

/* Libera o livro atual (PDF, páginas desenhadas e PageFlip) e zera o zoom */
function descartarLivro() {
    estado.tokenRenderizacao++;

    if (estado.pdf) {
        try { estado.pdf.destroy(); } catch (e) { /* ignora */ }
        estado.pdf = null;
    }
    if (estado.pageFlip) {
        try { estado.pageFlip.destroy(); } catch (e) { /* ignora */ }
        estado.pageFlip = null;
    }
    if (!document.getElementById('livro')) {
        livro = document.createElement('div');
        livro.id = 'livro';
        livro.className = 'livro';
        palcoLivro.appendChild(livro);
    }

    livro.innerHTML = '';
    estado.idCarregado = null;
    estado.deslocX = 0;
    estado.deslocY = 0;
    definirZoom(1);
}

async function abrirLivro() {
    // Dentro do clique do usuário: entra em tela cheia automaticamente
    entrarTelaCheia();

    fecharPrevia();

    modalLeitor.classList.add('esta-aberto');
    modalLeitor.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const processo = PROCESSOS[estado.idAtual];
    tituloLeitor.textContent = processo.titulo;
    atualizarNavegacaoProcessos();

    // Cada abertura começa sem zoom
    estado.deslocX = 0;
    estado.deslocY = 0;
    definirZoom(1);

    // Mesmo processo já carregado: apenas reabre o leitor
    if (estado.pageFlip && estado.idCarregado === estado.idAtual) {
        atualizarContador();
        return;
    }

    // Outro processo: descarta o livro anterior
    descartarLivro();

    carregandoLivro.innerHTML = htmlCarregando;
    carregandoLivro.style.display = 'flex';

    try {
        estado.pdf = await pdfjsLib.getDocument({
            url: processo.pdf,
            disableAutoFetch: true
        }).promise;
        estado.totalPaginas = estado.pdf.numPages;

        await criarPaginasLivro();
        criarPageFlip();
        await garantirPaginas(0);
        estado.idCarregado = estado.idAtual;

        carregandoLivro.style.display = 'none';
    } catch (erro) {
        console.error(erro);
        carregandoLivro.innerHTML =
            '<p>Não foi possível carregar o processo.</p>';
    }
}

async function criarPaginasLivro() {
    livro.innerHTML = '';
    estado.paginasRenderizadas = [];
    estado.estadosPaginas = new Array(estado.totalPaginas).fill(null);

    /*
     * Cada página do PDF vira uma "página" do livro, mas aqui só criamos
     * os espaços vazios. O desenho (canvas) é feito sob demanda em
     * garantirPaginas(), apenas para as páginas próximas da que está aberta.
     * Isso evita travar o computador em processos com muitas páginas.
     */
    const fragmento = document.createDocumentFragment();

    for (let numeroPagina = 1; numeroPagina <= estado.totalPaginas; numeroPagina++) {
        const containerPagina = document.createElement('div');
        containerPagina.className = 'pagina';
        containerPagina.dataset.numeroPagina = numeroPagina;

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        containerPagina.appendChild(canvas);
        fragmento.appendChild(containerPagina);

        estado.paginasRenderizadas.push(containerPagina);
    }

    /*
     * Se o total de páginas for ímpar, a última página ficaria sozinha
     * na dupla e o livro se descentraliza ao virá-la. Uma página em
     * branco no final mantém sempre a dupla completa.
     */
    if (estado.totalPaginas % 2 !== 0) {
        const paginaVazia = document.createElement('div');
        paginaVazia.className = 'pagina pagina-vazia';
        paginaVazia.style.background = '#f8f4e8';
        fragmento.appendChild(paginaVazia);
    }

    livro.appendChild(fragmento);
}

async function renderizarPaginaPdf(numeroPagina, canvas, pdf) {
    const pagina = await pdf.getPage(numeroPagina);

    /*
     * Largura fixa de renderização (em pixels): nítida o bastante para
     * o zoom, sem consumir memória demais por página.
     */
    const larguraAlvo = 1800;
    const viewportBase = pagina.getViewport({ scale: 1 });
    const viewport = pagina.getViewport({
        scale: larguraAlvo / viewportBase.width
    });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const contexto = canvas.getContext('2d');

    await pagina.render({
        canvasContext: contexto,
        viewport,
        background: '#ffffff'
    }).promise;

    pagina.cleanup();
}

/*
 * Garante que as páginas ao redor da posição atual estejam desenhadas
 * e libera a memória das páginas que ficaram muito longe.
 */
async function garantirPaginas(centro) {
    const pdf = estado.pdf;
    if (!pdf) return;

    const token = ++estado.tokenRenderizacao;
    const ultima = estado.totalPaginas - 1;
    const de = Math.max(0, centro - 2);
    const ate = Math.min(ultima, centro + 5);

    estado.paginasRenderizadas.forEach((conteiner, i) => {
        if (estado.estadosPaginas[i] === 'pronto' &&
            (i < centro - 6 || i > centro + 9)) {
            const canvas = conteiner.querySelector('canvas');
            canvas.width = 1;
            canvas.height = 1;
            estado.estadosPaginas[i] = null;
        }
    });

    const ordem = [];
    for (let i = de; i <= ate; i++) ordem.push(i);
    ordem.sort((a, b) => Math.abs(a - centro) - Math.abs(b - centro));

    for (const i of ordem) {
        if (token !== estado.tokenRenderizacao || estado.pdf !== pdf) return;
        if (estado.estadosPaginas[i]) continue;

        estado.estadosPaginas[i] = 'carregando';

        try {
            const canvas = estado.paginasRenderizadas[i].querySelector('canvas');
            await renderizarPaginaPdf(i + 1, canvas, pdf);
            estado.estadosPaginas[i] = estado.pdf === pdf ? 'pronto' : null;
        } catch (erro) {
            estado.estadosPaginas[i] = null;
            console.error(`Erro ao renderizar a página ${i + 1}:`, erro);
        }
    }
}

function criarPageFlip() {
    if (estado.pageFlip) {
        estado.pageFlip.destroy();
    }

    estado.pageFlip = new St.PageFlip(livro, {
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

    estado.pageFlip.loadFromHTML(
        document.querySelectorAll('.livro .pagina')
    );

    estado.pageFlip.on('flip', (evento) => {
        atualizarContador(evento.data);
        garantirPaginas(evento.data);
        tocarSomPagina();
    });

    atualizarContador(0);
}

function atualizarContador(indice) {
    if (!estado.pageFlip) return;

    const atual = typeof indice === 'number'
        ? indice
        : estado.pageFlip.getCurrentPageIndex();

    const primeira = atual + 1;
    const segunda = Math.min(atual + 2, estado.totalPaginas);

    if (estado.totalPaginas === 1 || primeira === segunda) {
        contadorPaginas.textContent = `${primeira} / ${estado.totalPaginas}`;
    } else {
        contadorPaginas.textContent =
            `${primeira}–${segunda} / ${estado.totalPaginas}`;
    }
}

function irParaAnterior() {
    if (estado.pageFlip) {
        estado.pageFlip.flipPrev();
    }
}

function irParaProxima() {
    if (estado.pageFlip) {
        estado.pageFlip.flipNext();
    }
}

/*
 * Sons de virar página: alternam em sequência a cada virada.
 * Usamos uma cópia do áudio a cada toque para que viradas rápidas
 * não cortem o som anterior.
 */
const SONS_PAGINA = [
    'som/virar_pagina.mp3',
    'som/virar_pagina_dois.mp3'
].map(caminho => {
    const audio = new Audio(caminho);
    audio.preload = 'auto';
    return audio;
});

let indiceSomPagina = 0;

function tocarSomPagina() {
    try {
        const som = SONS_PAGINA[indiceSomPagina].cloneNode();
        indiceSomPagina = (indiceSomPagina + 1) % SONS_PAGINA.length;

        som.volume = 0.8;
        som.play().catch(erro => {
            console.warn('Som de página indisponível:', erro);
        });
    } catch (erro) {
        console.warn('Som de página indisponível:', erro);
    }
}

const LARGURA_PAGINA = 601;
const ALTURA_PAGINA = 934;
const ZOOM_MINIMO = .75;
const ZOOM_MAXIMO = 3;

/*
 * Impede que o livro saia do enquadramento: quando ele cabe na área de
 * leitura não há deslocamento (fica centralizado); quando está ampliado,
 * só permite mover até as bordas das páginas.
 */
function limitarDeslocamento() {
    const larguraPalco = palcoLivro.clientWidth;
    const alturaPalco = palcoLivro.clientHeight;

    // Tamanho real da dupla de páginas dentro do contêiner
    const proporcao = (2 * LARGURA_PAGINA) / ALTURA_PAGINA;
    const alturaConteudo = Math.min(livro.offsetHeight, livro.offsetWidth / proporcao);
    const larguraConteudo = alturaConteudo * proporcao;

    const maxDeslocX = Math.max(0, (larguraConteudo * estado.zoom - larguraPalco) / 2);
    const maxDeslocY = Math.max(0, (alturaConteudo * estado.zoom - alturaPalco) / 2);

    estado.deslocX = Math.max(-maxDeslocX, Math.min(maxDeslocX, estado.deslocX));
    estado.deslocY = Math.max(-maxDeslocY, Math.min(maxDeslocY, estado.deslocY));
}

function aplicarTransformacao() {
    limitarDeslocamento();

    livro.style.transform =
        `translate(${estado.deslocX}px, ${estado.deslocY}px) scale(${estado.zoom})`;

    valorZoom.textContent = `${Math.round(estado.zoom * 100)}%`;

    // Ampliado: arrastar move a página (não vira). Virar: setas/teclado.
    const ampliado = estado.zoom > 1.02;
    livro.style.pointerEvents = ampliado ? 'none' : '';
    palcoLivro.classList.toggle('esta-ampliado', ampliado);
}

function definirZoom(valor, pontoX = null, pontoY = null) {
    const zoomAnterior = estado.zoom;

    const novoZoom = Math.max(ZOOM_MINIMO, Math.min(ZOOM_MAXIMO, valor));
    const fator = novoZoom / zoomAnterior;

    if (pontoX !== null && pontoY !== null) {
        // Zoom apontado: mantém o ponto sob o cursor/dedos no mesmo lugar
        const retangulo = palcoLivro.getBoundingClientRect();

        const relX = pontoX - retangulo.left - retangulo.width / 2;
        const relY = pontoY - retangulo.top - retangulo.height / 2;

        estado.deslocX = relX - (relX - estado.deslocX) * fator;
        estado.deslocY = relY - (relY - estado.deslocY) * fator;
    } else {
        // Botões/teclado: amplia/reduz em torno do centro da tela
        estado.deslocX *= fator;
        estado.deslocY *= fator;
    }

    estado.zoom = novoZoom;
    aplicarTransformacao();
}

function alterarZoom(quantidade, mouseX = null, mouseY = null) {
    definirZoom(
        estado.zoom + quantidade,
        mouseX,
        mouseY
    );
}

/* Tela cheia da página inteira (equivale ao F11) */
async function entrarTelaCheia() {
    try {
        const raiz = document.documentElement;
        if (!document.fullscreenElement && raiz.requestFullscreen) {
            await raiz.requestFullscreen();
        }
    } catch (erro) {
        console.warn('Tela cheia não disponível:', erro);
    }
}

async function alternarTelaCheia() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (erro) {
        console.warn('Tela cheia não disponível:', erro);
    }
}

function ocultarLeitor() {
    modalLeitor.classList.remove('esta-aberto');
    modalLeitor.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* Processos na ordem e com os filtros/pesquisa aplicados na landing page */
function obterIdsNavegacao() {
    const ids = [...document.querySelectorAll('.cartao-processo')]
        .filter(cartao => cartao.style.display !== 'none')
        .map(cartao => cartao.dataset.idProcesso)
        .filter(id => PROCESSOS[id]);

    return ids.includes(estado.idAtual) ? ids : Object.keys(PROCESSOS);
}

/* Mostra o nome do processo anterior/próximo nos botões do topo */
function atualizarNavegacaoProcessos() {
    const ids = obterIdsNavegacao();
    const indice = ids.indexOf(estado.idAtual);
    const anterior = PROCESSOS[ids[(indice - 1 + ids.length) % ids.length]].titulo;
    const proximo = PROCESSOS[ids[(indice + 1) % ids.length]].titulo;

    // Só um processo no filtro: não há para onde navegar
    const visibilidade = ids.length > 1 ? '' : 'hidden';
    document.getElementById('processoAnterior').style.visibility = visibilidade;
    document.getElementById('proximoProcesso').style.visibility = visibilidade;

    document.getElementById('rotuloProcessoAnterior').textContent = anterior;
    document.getElementById('rotuloProximoProcesso').textContent = proximo;
    document.getElementById('processoAnterior').title = anterior;
    document.getElementById('processoAnterior').setAttribute('aria-label', anterior);
    document.getElementById('proximoProcesso').title = proximo;
    document.getElementById('proximoProcesso').setAttribute('aria-label', proximo);
}

/* X: fecha o leitor e volta para a prévia do mesmo processo */
function fecharLeitor() {
    ocultarLeitor();
    abrirPrevia(estado.idAtual);
}

/* Setas do topo: abre a prévia do processo anterior (-1) ou seguinte (+1) */
function irParaProcesso(passo) {
    const ids = obterIdsNavegacao();
    const indice = ids.indexOf(estado.idAtual);
    const alvo = ids[(indice + passo + ids.length) % ids.length];

    ocultarLeitor();
    abrirPrevia(alvo);
}

/* Filtro: ordem cronológica (ano lido do nº do processo) e tipo (1º título do card) */
const estadoFiltro = { ordem: '', tipo: '' };

function obterMetaCartao(cartao) {
    const tipo = (cartao.querySelector('.tipo-processo')?.textContent || '').split('–')[0].trim();
    const numero = cartao.querySelector('.cartao-processo-info p:not(.tipo-processo)')?.textContent || '';
    const correspondencia = numero.match(/\/\s*(\d{2,4})/);
    let ano = correspondencia ? parseInt(correspondencia[1], 10) : null;
    if (correspondencia && correspondencia[1].length === 2) ano += 1900;
    return { tipo, ano };
}

function aplicarFiltros() {
    const grade = document.getElementById('gradeProcessos');
    const consulta = buscaProcesso.value.trim().toLowerCase();
    const cartoes = [...grade.querySelectorAll('.cartao-processo')];

    cartoes.sort((a, b) => {
        const anoA = a.dataset.ano;
        const anoB = b.dataset.ano;

        if (estadoFiltro.ordem) {
            if (anoA && anoB && anoA !== anoB) return estadoFiltro.ordem === 'crescente' ? anoA - anoB : anoB - anoA;
            if (!anoA !== !anoB) return anoA ? -1 : 1;
        }
        return a.dataset.indice - b.dataset.indice;
    });

    let visiveis = 0;

    cartoes.forEach(cartao => {
        grade.appendChild(cartao);

        const correspondeNome = cartao.dataset.nomeProcesso.toLowerCase().includes(consulta);
        const correspondeTipo = !estadoFiltro.tipo || cartao.dataset.tipo === estadoFiltro.tipo;
        const correspondencia = correspondeNome && correspondeTipo;

        cartao.style.display = correspondencia ? '' : 'none';
        if (correspondencia) visiveis++;
    });

    semResultados.hidden = visiveis !== 0;

    document.querySelectorAll('.filtro-opcao').forEach(opcao => {
        const selecionado = opcao.dataset.ordem
            ? opcao.dataset.ordem === estadoFiltro.ordem
            : opcao.dataset.tipo === estadoFiltro.tipo;
        opcao.classList.toggle('esta-selecionado', selecionado);
    });

    const ativo = Boolean(estadoFiltro.ordem || estadoFiltro.tipo);
    document.getElementById('alternarFiltro').classList.toggle('esta-ativo', ativo);
    document.getElementById('limparFiltro').hidden = !ativo;
}

function configurarBusca() {
    buscaProcesso.addEventListener('input', aplicarFiltros);
}

function configurarFiltro() {
    const alternador = document.getElementById('alternarFiltro');
    const menu = document.getElementById('menuFiltro');
    const caixaTipos = document.getElementById('opcoesTipoFiltro');
    const cartoes = [...document.querySelectorAll('.cartao-processo')];

    cartoes.forEach((cartao, indice) => {
        const { tipo, ano } = obterMetaCartao(cartao);
        cartao.dataset.indice = indice;
        cartao.dataset.tipo = tipo;
        if (ano) cartao.dataset.ano = ano;
    });

    [...new Set(cartoes.map(cartao => cartao.dataset.tipo).filter(Boolean))].forEach(tipo => {
        const opcao = document.createElement('button');
        opcao.type = 'button';
        opcao.className = 'filtro-opcao';
        opcao.dataset.tipo = tipo;
        opcao.textContent = tipo;
        caixaTipos.appendChild(opcao);
    });

    const fecharMenu = () => {
        menu.hidden = true;
        alternador.setAttribute('aria-expanded', 'false');
    };

    alternador.addEventListener('click', evento => {
        evento.stopPropagation();
        menu.hidden = !menu.hidden;
        alternador.setAttribute('aria-expanded', String(!menu.hidden));
    });

    document.addEventListener('click', fecharMenu);
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') fecharMenu();
    });

    menu.addEventListener('click', evento => {
        evento.stopPropagation();

        const topico = evento.target.closest('.filtro-topico');
        if (topico) {
            const opcoes = topico.nextElementSibling;
            opcoes.hidden = !opcoes.hidden;
            topico.setAttribute('aria-expanded', String(!opcoes.hidden));
            return;
        }

        const opcao = evento.target.closest('.filtro-opcao');
        if (!opcao) return;

        if (opcao.dataset.ordem) {
            estadoFiltro.ordem = estadoFiltro.ordem === opcao.dataset.ordem ? '' : opcao.dataset.ordem;
        } else {
            estadoFiltro.tipo = estadoFiltro.tipo === opcao.dataset.tipo ? '' : opcao.dataset.tipo;
        }
        aplicarFiltros();
    });

    document.getElementById('limparFiltro').addEventListener('click', () => {
        estadoFiltro.ordem = '';
        estadoFiltro.tipo = '';
        aplicarFiltros();
    });
}

function configurarEventos() {
    document.querySelectorAll('.cartao-processo').forEach(cartao => {
        cartao.querySelector('.cartao-processo-botao')
            .addEventListener('click', () => abrirPrevia(cartao.dataset.idProcesso));
    });

    document.getElementById('fecharPrevia')
        .addEventListener('click', fecharPrevia);

    document.querySelector('[data-fechar="previa"]')
        .addEventListener('click', fecharPrevia);

    document.getElementById('abrirLivro')
        .addEventListener('click', abrirLivro);

    document.getElementById('fecharLeitor')
        .addEventListener('click', fecharLeitor);

    document.getElementById('irParaInicio')
        .addEventListener('click', ocultarLeitor);

    document.getElementById('processoAnterior')
        .addEventListener('click', () => irParaProcesso(-1));

    document.getElementById('proximoProcesso')
        .addEventListener('click', () => irParaProcesso(1));

    document.getElementById('paginaAnterior')
        .addEventListener('click', irParaAnterior);

    document.getElementById('proximaPagina')
        .addEventListener('click', irParaProxima);

    document.getElementById('diminuirZoom')
        .addEventListener('click', () => alterarZoom(-.15));

    document.getElementById('aumentarZoom')
        .addEventListener('click', () => alterarZoom(.15));

    const botaoTelaCheia = document.getElementById('telaCheiaPagina');
    if (document.documentElement.requestFullscreen) {
        botaoTelaCheia.addEventListener('click', alternarTelaCheia);
    } else {
        botaoTelaCheia.hidden = true;
    }

    buscaProcesso.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            buscaProcesso.value = '';
            buscaProcesso.dispatchEvent(new Event('input'));
        }
    });

    document.addEventListener('keydown', evento => {
        if (!modalLeitor.classList.contains('esta-aberto')) return;

        if (evento.key === 'ArrowLeft') irParaAnterior();
        if (evento.key === 'ArrowRight') irParaProxima();
        if (evento.key === 'Escape') fecharLeitor();
        if (evento.key === '+' || evento.key === '=') alterarZoom(.15);
        if (evento.key === '-') alterarZoom(-.15);
    });

    /*
     * Scroll do mouse para zoom.
     * No touch, o PageFlip utiliza o gesto de arrastar/swipe.
     */
    palcoLivro.addEventListener('wheel', evento => {
        if (!modalLeitor.classList.contains('esta-aberto')) return;

        evento.preventDefault();

        const quantidadeZoom = evento.deltaY < 0 ? 0.1 : -0.1;

        alterarZoom(
            quantidadeZoom,
            evento.clientX,
            evento.clientY
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
function configurarGestosLeitor() {
    const toque = {
        modo: null, inicioX: 0, inicioY: 0, deslocX: 0, deslocY: 0,
        distInicial: 0, zoom: 1, medioX: 0, medioY: 0, foiPinca: false,
        virando: false, alvo: null, ultimoX: 0, ultimoY: 0
    };

    // Reproduz o mouse para o PageFlip (ele já faz o efeito de folhear)
    function dispararMouse(tipo, x, y) {
        let alvo = toque.alvo;
        if (!alvo || !livro.contains(alvo)) {
            alvo = livro.querySelector('.stf__wrapper') || livro;
        }
        alvo.dispatchEvent(new MouseEvent(tipo, {
            bubbles: true, cancelable: true, view: window, button: 0,
            buttons: tipo === 'mouseup' ? 0 : 1, clientX: x, clientY: y
        }));
    }

    const distancia = t => Math.hypot(
        t[0].clientX - t[1].clientX,
        t[0].clientY - t[1].clientY
    );
    const pontoMedio = t => ({
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2
    });

    function iniciarUmDedo(t) {
        toque.modo = 'umDedo';
        toque.virando = false;
        toque.alvo = t.target;
        toque.inicioX = t.clientX;
        toque.inicioY = t.clientY;
        toque.deslocX = estado.deslocX;
        toque.deslocY = estado.deslocY;
    }

    function aoIniciarToque(evento) {
        if (!modalLeitor.classList.contains('esta-aberto')) return;

        // Impede o PageFlip e o navegador de tratarem este toque
        evento.preventDefault();
        evento.stopPropagation();

        palcoLivro.classList.add('esta-gesticulando');

        const t = evento.touches;

        if (t.length >= 2) {
            // Segundo dedo: encerra o arrasto de página que estava em andamento
            if (toque.virando) {
                dispararMouse('mouseup', toque.ultimoX, toque.ultimoY);
                toque.virando = false;
            }

            const medio = pontoMedio(t);
            toque.modo = 'pinca';
            toque.foiPinca = true;
            toque.distInicial = distancia(t);
            toque.zoom = estado.zoom;
            toque.medioX = medio.x;
            toque.medioY = medio.y;
        } else {
            toque.foiPinca = false;
            iniciarUmDedo(t[0]);
        }
    }

    function aoMoverToque(evento) {
        if (!toque.modo) return;

        evento.preventDefault();
        evento.stopPropagation();

        const t = evento.touches;

        if (toque.modo === 'pinca' && t.length >= 2) {
            const medio = pontoMedio(t);

            definirZoom(toque.zoom * (distancia(t) / toque.distInicial), medio.x, medio.y);

            // Acompanha o movimento dos dedos durante a pinça
            estado.deslocX += medio.x - toque.medioX;
            estado.deslocY += medio.y - toque.medioY;
            toque.medioX = medio.x;
            toque.medioY = medio.y;
            aplicarTransformacao();
        } else if (toque.modo === 'umDedo' && t.length === 1 && estado.zoom > 1.02) {
            estado.deslocX = toque.deslocX + (t[0].clientX - toque.inicioX);
            estado.deslocY = toque.deslocY + (t[0].clientY - toque.inicioY);
            aplicarTransformacao();
        } else if (toque.modo === 'umDedo' && t.length === 1 && !toque.foiPinca) {
            // Sem zoom: o dedo arrasta a página como o mouse
            const x = t[0].clientX;
            const y = t[0].clientY;

            if (!toque.virando) {
                if (Math.hypot(x - toque.inicioX, y - toque.inicioY) < 6) return;
                toque.virando = true;
                dispararMouse('mousedown', toque.inicioX, toque.inicioY);
            }

            toque.ultimoX = x;
            toque.ultimoY = y;
            dispararMouse('mousemove', x, y);
        }
    }

    function aoFinalizarToque(evento) {
        if (!toque.modo) return;

        evento.preventDefault();
        evento.stopPropagation();

        const restantes = evento.touches;

        // Soltou o dedo: o PageFlip decide se a página vira ou volta
        if (toque.virando && evento.changedTouches.length) {
            const c = evento.changedTouches[0];
            dispararMouse('mouseup', c.clientX, c.clientY);
            toque.virando = false;
        }

        if (restantes.length === 0) {
            toque.modo = null;
            palcoLivro.classList.remove('esta-gesticulando');

            // Perto de 100%: volta exatamente a 100%, centralizado
            if (Math.abs(estado.zoom - 1) < .05) {
                definirZoom(1);
            }
        } else if (restantes.length === 1) {
            // Soltou um dos dedos da pinça: continua movendo com o outro
            iniciarUmDedo(restantes[0]);
        }
    }

    const opcoes = { passive: false, capture: true };
    palcoLivro.addEventListener('touchstart', aoIniciarToque, opcoes);
    palcoLivro.addEventListener('touchmove', aoMoverToque, opcoes);
    palcoLivro.addEventListener('touchend', aoFinalizarToque, opcoes);
    palcoLivro.addEventListener('touchcancel', aoFinalizarToque, opcoes);

    // Mouse: arrastar para mover a página ampliada
    let arrasteMouse = null;

    palcoLivro.addEventListener('pointerdown', evento => {
        if (evento.pointerType !== 'mouse' || evento.button !== 0) return;
        if (estado.zoom <= 1.02) return;

        arrasteMouse = {
            x: evento.clientX,
            y: evento.clientY,
            deslocX: estado.deslocX,
            deslocY: estado.deslocY
        };

        palcoLivro.setPointerCapture(evento.pointerId);
        palcoLivro.classList.add('esta-gesticulando');
    });

    palcoLivro.addEventListener('pointermove', evento => {
        if (!arrasteMouse) return;

        estado.deslocX = arrasteMouse.deslocX + (evento.clientX - arrasteMouse.x);
        estado.deslocY = arrasteMouse.deslocY + (evento.clientY - arrasteMouse.y);
        aplicarTransformacao();
    });

    const terminarArrasteMouse = () => {
        arrasteMouse = null;
        palcoLivro.classList.remove('esta-gesticulando');
    };

    palcoLivro.addEventListener('pointerup', terminarArrasteMouse);
    palcoLivro.addEventListener('pointercancel', terminarArrasteMouse);
}

/* Cria os cards da tela inicial a partir de PROCESSOS */
function renderizarCartoes() {
    const grade = document.getElementById('gradeProcessos');
    grade.innerHTML = '';

    Object.entries(PROCESSOS).forEach(([id, processo]) => {
        const { cartao } = processo;

        const artigo = document.createElement('article');
        artigo.className = 'cartao-processo';
        artigo.dataset.nomeProcesso = cartao.nome;
        artigo.dataset.idProcesso = id;

        artigo.innerHTML = `
            <button class="cartao-processo-botao" type="button">
                <div class="miniatura-processo-envoltorio">
                    <img class="miniatura-processo" alt="">
                    <div class="sobreposicao-abrir">ABRIR PROCESSO</div>
                </div>

                <div class="cartao-processo-info">
                    <p class="tipo-processo"></p>
                    <h3></h3>
                    <p></p>
                </div>
            </button>`;

        const imagem = artigo.querySelector('.miniatura-processo');
        imagem.src = cartao.miniatura;
        imagem.alt = cartao.alt;

        artigo.querySelector('.tipo-processo').textContent = cartao.tipo;
        artigo.querySelector('h3').textContent = cartao.cabecalho;
        artigo.querySelector('.cartao-processo-info p:last-child').textContent = cartao.numero;

        grade.appendChild(artigo);
    });
}

/* Volta ao estado inicial: fecha prévia/leitor, limpa busca e filtros, libera memória */
function voltarAoInicio() {
    ocultarLeitor();
    fecharPrevia();

    document.getElementById('menuFiltro').hidden = true;
    document.getElementById('alternarFiltro').setAttribute('aria-expanded', 'false');

    buscaProcesso.value = '';
    estadoFiltro.ordem = '';
    estadoFiltro.tipo = '';
    aplicarFiltros();

    descartarLivro();
    estado.idAtual = null;

    window.scrollTo(0, 0);
}

/* Quiosque: depois de um tempo sem uso, prepara a tela para o próximo visitante */
function configurarRedefinicaoOciosidade() {
    if (!TEMPO_OCIOSO_MS) return;

    let temporizador = null;
    let ultimaAtividade = 0;

    const algoParaRedefinir = () =>
        modalPrevia.classList.contains('esta-aberto') ||
        modalLeitor.classList.contains('esta-aberto') ||
        buscaProcesso.value !== '' ||
        estadoFiltro.ordem !== '' ||
        estadoFiltro.tipo !== '' ||
        window.scrollY > 0;

    const agendar = () => {
        const agora = Date.now();
        if (temporizador && agora - ultimaAtividade < 1000) return;   // evita reagendar a cada pixel
        ultimaAtividade = agora;

        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
            if (algoParaRedefinir()) voltarAoInicio();
        }, TEMPO_OCIOSO_MS);
    };

    // Captura: enxerga também os toques que o leitor interrompe (stopPropagation)
    ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach(tipo => {
        document.addEventListener(tipo, agendar, { passive: true, capture: true });
    });

    agendar();
}

renderizarCartoes();
configurarBusca();
configurarFiltro();
configurarEventos();
configurarZoomPrevia();
configurarGestosLeitor();
configurarRedefinicaoOciosidade();