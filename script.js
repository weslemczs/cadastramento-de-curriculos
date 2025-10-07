const experienciasContainer = document.getElementById('experienciasContainer');
const formacoesContainer = document.getElementById('formacoesContainer');
const adicionarExperienciaBtn = document.getElementById('adicionarExperiencia');
const adicionarFormacaoBtn = document.getElementById('adicionarFormacao');
const curriculosLista = document.getElementById('curriculosLista');
const formulario = document.getElementById('curriculoForm');
const anoAtual = document.getElementById('anoAtual');

const STORAGE_KEY = 'curriculo_app_v1';

anoAtual.textContent = new Date().getFullYear();

function criarCampo(prefixo, campos) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('grid');

    campos.forEach(({ label, type = 'text', name, placeholder, required = false }) => {
        const field = document.createElement('label');
        field.innerHTML = `
            ${label}
            <input type="${type}" name="${prefixo}-${name}" placeholder="${placeholder ?? ''}" ${required ? 'required' : ''}>
        `;
        wrapper.appendChild(field);
    });

    return wrapper;
}

function criarBlocoExperiencia() {
    const bloco = document.createElement('div');
    bloco.className = 'dynamic-item';

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'dynamic-item__remove';
    remover.textContent = 'Remover';
    remover.addEventListener('click', () => bloco.remove());

    const campos = criarCampo('experiencia', [
        { label: 'Empresa', name: 'empresa', placeholder: 'Ex: Empresa XYZ', required: true },
        { label: 'Cargo', name: 'cargo', placeholder: 'Ex: Analista de RH', required: true },
        { label: 'Período', name: 'periodo', placeholder: 'Ex: 2019 - Atual', required: true },
        { label: 'Principais atividades', name: 'atividades', placeholder: 'Ex: Gestão de equipe, recrutamento...' }
    ]);

    bloco.append(remover, campos);
    experienciasContainer.appendChild(bloco);
}

function criarBlocoFormacao() {
    const bloco = document.createElement('div');
    bloco.className = 'dynamic-item';

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'dynamic-item__remove';
    remover.textContent = 'Remover';
    remover.addEventListener('click', () => bloco.remove());

    const campos = criarCampo('formacao', [
        { label: 'Instituição', name: 'instituicao', placeholder: 'Ex: Universidade ABC', required: true },
        { label: 'Curso', name: 'curso', placeholder: 'Ex: Administração', required: true },
        { label: 'Período', name: 'periodo', placeholder: 'Ex: 2015 - 2019', required: true }
    ]);

    bloco.append(remover, campos);
    formacoesContainer.appendChild(bloco);
}

function obterValoresDinamicos(prefixo, container) {
    return Array.from(container.querySelectorAll('.dynamic-item')).map((item) => {
        const inputs = item.querySelectorAll('input');
        const dados = {};

        inputs.forEach((input) => {
            const key = input.name.replace(`${prefixo}-`, '');
            dados[key] = input.value.trim();
        });

        return dados;
    }).filter((obj) => Object.values(obj).some((valor) => valor));
}

function salvarNoStorage(curriculos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curriculos));
}

function carregarDoStorage() {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : [];
}

function limparFormulario() {
    formulario.reset();
    experienciasContainer.innerHTML = '';
    formacoesContainer.innerHTML = '';
    criarBlocoExperiencia();
    criarBlocoFormacao();
}

function criarLista(lista) {
    if (!lista.length) return '<p>Nenhum registro informado.</p>';

    return `
        <ul>
            ${lista
                .map((item) => `
                    <li>
                        ${Object.values(item)
                            .filter(Boolean)
                            .join(' · ')}
                    </li>
                `)
                .join('')}
        </ul>
    `;
}

function renderizarCurriculos(curriculos) {
    curriculosLista.innerHTML = '';

    if (!curriculos.length) {
        curriculosLista.innerHTML = '<p class="placeholder">Nenhum currículo cadastrado ainda. Preencha o formulário para começar.</p>';
        return;
    }

    curriculos.forEach((curriculo, indice) => {
        const card = document.createElement('article');
        card.className = 'curriculo-card';
        card.innerHTML = `
            <h3>${curriculo.nome}</h3>
            <p class="curriculo-card__section">${curriculo.resumo}</p>
            <div class="curriculo-card__section">
                <h4>Contato</h4>
                <p>${curriculo.email} · ${curriculo.telefone} · ${curriculo.localizacao}</p>
                ${curriculo.link ? `<p><a href="${curriculo.link}" target="_blank" rel="noopener">${curriculo.link}</a></p>` : ''}
            </div>
            <div class="curriculo-card__section">
                <h4>Experiências</h4>
                ${criarLista(curriculo.experiencias)}
            </div>
            <div class="curriculo-card__section">
                <h4>Formação</h4>
                ${criarLista(curriculo.formacoes)}
            </div>
            <div class="curriculo-card__section">
                <h4>Competências</h4>
                <p>${curriculo.habilidades}</p>
                ${curriculo.idiomas ? `<p>Idiomas: ${curriculo.idiomas}</p>` : ''}
            </div>
            <button class="button button--ghost" data-remover="${indice}">Excluir currículo</button>
        `;
        curriculosLista.appendChild(card);
    });
}

function inicializarListas() {
    if (!experienciasContainer.children.length) criarBlocoExperiencia();
    if (!formacoesContainer.children.length) criarBlocoFormacao();
}

adicionarExperienciaBtn.addEventListener('click', criarBlocoExperiencia);
adicionarFormacaoBtn.addEventListener('click', criarBlocoFormacao);

curriculosLista.addEventListener('click', (event) => {
    const alvo = event.target;
    if (alvo.matches('button[data-remover]')) {
        const indice = Number(alvo.dataset.remover);
        const curriculos = carregarDoStorage();
        curriculos.splice(indice, 1);
        salvarNoStorage(curriculos);
        renderizarCurriculos(curriculos);
    }
});

formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(formulario);

    const curriculo = {
        nome: formData.get('nome').trim(),
        email: formData.get('email').trim(),
        telefone: formData.get('telefone').trim(),
        localizacao: formData.get('localizacao').trim(),
        resumo: formData.get('resumo').trim(),
        habilidades: formData.get('habilidades').trim(),
        idiomas: formData.get('idiomas').trim(),
        link: formData.get('link').trim(),
        experiencias: obterValoresDinamicos('experiencia', experienciasContainer),
        formacoes: obterValoresDinamicos('formacao', formacoesContainer)
    };

    const curriculos = carregarDoStorage();
    curriculos.push(curriculo);
    salvarNoStorage(curriculos);
    renderizarCurriculos(curriculos);

    limparFormulario();
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

window.addEventListener('DOMContentLoaded', () => {
    inicializarListas();
    const curriculos = carregarDoStorage();
    renderizarCurriculos(curriculos);
});
