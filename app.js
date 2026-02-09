// Dados do aplicativo (armazenamento local)
const CHAVE_DADOS = 'zeroGastosDados';
const CHAVE_CONFIG = 'zeroGastosConfig';

// Configurações padrão
const configPadrao = {
    metaDiaria: 0, // Meta: não gastar nada
    diasConsecutivos: 0,
    ultimaData: null,
    medalhas: {
        dia1: false,
        dias3: false,
        dias7: false,
        dias30: false
    }
};

// Dados padrão
const dadosPadrao = {
    gastos: [],
    categorias: {
        padaria: { nome: "Padaria", icone: "fas fa-bread-slice", cor: "#FF9800" },
        compras: { nome: "Compras Online", icone: "fas fa-shopping-bag", cor: "#2196F3" },
        gasolina: { nome: "Gasolina", icone: "fas fa-gas-pump", cor: "#795548" },
        farmacia: { nome: "Farmácia", icone: "fas fa-pills", cor: "#4CAF50" },
        bares: { nome: "Bares", icone: "fas fa-beer", cor: "#FF5722" },
        ifood: { nome: "iFood", icone: "fas fa-hamburger", cor: "#E91E63" },
        uber: { nome: "Uber", icone: "fas fa-taxi", cor: "#000000" },
        outros: { nome: "Outros", icone: "fas fa-ellipsis-h", cor: "#9C27B0" }
    }
};

// Carregar dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem(CHAVE_DADOS);
    const configSalva = localStorage.getItem(CHAVE_CONFIG);
    
    return {
        dados: dadosSalvos ? JSON.parse(dadosSalvos) : dadosPadrao,
        config: configSalva ? JSON.parse(configSalva) : configPadrao
    };
}

// Salvar dados no localStorage
function salvarDados(dados, config) {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    localStorage.setItem(CHAVE_CONFIG, JSON.stringify(config));
}

// Obter data atual formatada
function getDataAtual() {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Obter data formatada para exibição
function formatarData(dataStr) {
    const data = new Date(dataStr);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (dataStr === getDataAtual()) {
        return "Hoje";
    } else if (dataStr === ontem.toISOString().split('T')[0]) {
        return "Ontem";
    } else {
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Inicializar aplicativo
let dadosApp, configApp;

function inicializarApp() {
    // Carregar dados
    const { dados, config } = carregarDados();
    dadosApp = dados;
    configApp = config;
    
    // Verificar se é um novo dia
    const dataAtual = getDataAtual();
    if (configApp.ultimaData !== dataAtual) {
        // Novo dia - verificar se gastou no dia anterior
        if (configApp.ultimaData) {
            const gastosOntem = dadosApp.gastos.filter(g => g.data === configApp.ultimaData);
            if (gastosOntem.length === 0) {
                // Não gastou ontem - incrementar contador
                configApp.diasConsecutivos++;
                verificarMedalhas();
            } else {
                // Gastou ontem - reiniciar contador
                configApp.diasConsecutivos = 0;
            }
        }
        configApp.ultimaData = dataAtual;
        salvarDados(dadosApp, configApp);
    }
    
    // Atualizar interface
    atualizarInterface();
    
    // Ocultar tela de carregamento após 1.5 segundos
    setTimeout(() => {
        document.getElementById('carregando').style.display = 'none';
        document.getElementById('telaPrincipal').style.display = 'block';
    }, 1500);
}

// Atualizar interface principal
function atualizarInterface() {
    // Atualizar contador de dias
    document.getElementById('diasSemGastar').textContent = configApp.diasConsecutivos;
    
    // Atualizar progresso da meta
    const gastosHoje = dadosApp.gastos.filter(g => g.data === getDataAtual());
    const totalHoje = gastosHoje.reduce((total, gasto) => total + gasto.valor, 0);
    const porcentagem = Math.min(100, (totalHoje / 1) * 100); // Meta é 0, então qualquer gasto é 100%
    
    const progressoBar = document.getElementById('progressoMeta');
    progressoBar.style.width = `${porcentagem}%`;
    
    if (totalHoje > 0) {
        progressoBar.style.background = 'linear-gradient(90deg, var(--vermelho) 0%, var(--vermelho-escuro) 100%)';
        document.getElementById('textoProgresso').textContent = `R$ ${totalHoje.toFixed(2)} gastos`;
    } else {
        progressoBar.style.background = 'linear-gradient(90deg, var(--verde) 0%, #4CAF50 100%)';
        document.getElementById('textoProgresso').textContent = '100% - Meta alcançada!';
    }
    
    document.getElementById('saldoHoje').textContent = 
        totalHoje > 0 ? `R$ ${totalHoje.toFixed(2)} gastos hoje` : 'Nenhum gasto hoje! 🎉';
    
    // Atualizar medalhas
    atualizarMedalhas();
    
    // Atualizar lista de gastos de hoje
    atualizarListaGastos();
    
    // Atualizar calendário
    atualizarCalendario();
}

// Atualizar medalhas
function atualizarMedalhas() {
    const medalhas = document.querySelectorAll('.medalha');
    
    // Medalha de 1 dia
    if (configApp.diasConsecutivos >= 1) {
        medalhas[0].classList.add('ativa');
    }
    
    // Medalha de 3 dias
    if (configApp.diasConsecutivos >= 3) {
        medalhas[1].classList.add('ativa');
    }
    
    // Medalha de 7 dias
    if (configApp.diasConsecutivos >= 7) {
        medalhas[2].classList.add('ativa');
    }
    
    // Medalha de 30 dias
    if (configApp.diasConsecutivos >= 30) {
        medalhas[3].classList.add('ativa');
    }
}

// Verificar medalhas
function verificarMedalhas() {
    if (configApp.diasConsecutivos >= 1 && !configApp.medalhas.dia1) {
        configApp.medalhas.dia1 = true;
        mostrarNotificacao('🎉 Parabéns! Você ganhou a medalha de 1 dia sem gastar!');
    }
    
    if (configApp.diasConsecutivos >= 3 && !configApp.medalhas.dias3) {
        configApp.medalhas.dias3 = true;
        mostrarNotificacao('🏆 Incrível! Medalha de 3 dias consecutivos sem gastar!');
    }
    
    if (configApp.diasConsecutivos >= 7 && !configApp.medalhas.dias7) {
        configApp.medalhas.dias7 = true;
        mostrarNotificacao('🌟 Fantástico! 7 dias sem gastar! Você é um mestre da economia!');
    }
    
    if (configApp.diasConsecutivos >= 30 && !configApp.medalhas.dias30) {
        configApp.medalhas.dias30 = true;
        mostrarNotificacao('👑 LENDÁRIO! 30 DIAS SEM GASTAR! Você é uma lenda da economia!');
    }
}

// Mostrar notificação
function mostrarNotificacao(mensagem) {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';
    notificacao.innerHTML = `
        <i class="fas fa-trophy"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilos para a notificação
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    `;
    
    // Adicionar ao documento
    document.body.appendChild(notificacao);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => notificacao.remove(), 300);
    }, 5000);
}

// Atualizar lista de gastos de hoje
function atualizarListaGastos() {
    const listaGastos = document.getElementById('listaGastos');
    const gastosHoje = dadosApp.gastos.filter(g => g.data === getDataAtual());
    
    if (gastosHoje.length === 0) {
        listaGastos.innerHTML = `
            <div class="sem-gastos">
                <i class="fas fa-check-circle"></i>
                <p>Nenhum gasto hoje! Continue assim!</p>
            </div>
        `;
        return;
    }
    
    listaGastos.innerHTML = gastosHoje.map(gasto => {
        const categoria = dadosApp.categorias[gasto.categoria];
        return `
            <div class="gasto-item">
                <div class="gasto-info">
                    <div class="gasto-categoria" style="background: ${categoria.cor};">
                        <i class="${categoria.icone}"></i>
                    </div>
                    <div class="gasto-detalhes">
                        <h4>${categoria.nome}</h4>
                        <p>${gasto.descricao} • ${gasto.pagamento}</p>
                    </div>
                </div>
                <div class="gasto-valor">
                    R$ ${gasto.valor.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Atualizar calendário
function atualizarCalendario() {
    const calendario = document.getElementById('calendarioDias');
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    let html = '';
    
    // Dias do mês
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
        const dataStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const gastosDia = dadosApp.gastos.filter(g => g.data === dataStr);
        const temGasto = gastosDia.length > 0;
        const eHoje = i === hoje.getDate();
        
        let classe = 'dia-calendario';
        if (eHoje) classe += ' hoje';
        else if (temGasto) classe += ' com-gasto';
        else classe += ' sem-gasto';
        
        html += `<div class="${classe}" onclick="verDia(${i})">${i}</div>`;
    }
    
    calendario.innerHTML = html;
}

// Funções para navegação
function mostrarTela(tela) {
    // Esconder todas as telas
    document.getElementById('telaPrincipal').style.display = 'none';
    document.getElementById('telaRegistro').style.display = 'none';
    document.getElementById('telaRelatorio').style.display = 'none';
    
    // Mostrar tela selecionada
    if (tela === 'principal') {
        document.getElementById('telaPrincipal').style.display = 'block';
        atualizarInterface();
    } else {
        document.getElementById(`tela${tela.charAt(0).toUpperCase() + tela.slice(1)}`).style.display = 'block';
    }
    
    // Atualizar menu
    atualizarMenu(tela);
}

function voltarPrincipal() {
    mostrarTela('principal');
}

function mostrarRegistro() {
    mostrarTela('registro');
    // Limpar formulário
    document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('selecionada'));
    document.querySelectorAll('.pagamento-option').forEach(opt => opt.classList.remove('selecionada'));
    document.getElementById('valorGasto').value = '';
    document.getElementById('descricaoGasto').value = '';
}

function mostrarRelatorio() {
    mostrarTela('relatorio');
    atualizarRelatorio();
}

function mostrarCalendario() {
    // Para este exemplo, vamos apenas mostrar a tela principal
    // Em uma versão completa, teríamos uma tela de calendário dedicada
    mostrarTela('principal');
}

function atualizarMenu(telaAtiva) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('ativo'));
    
    if (telaAtiva === 'principal') {
        document.querySelector('.menu-item:nth-child(1)').classList.add('ativo');
    } else if (telaAtiva === 'registro') {
        document.querySelector('.menu-item:nth-child(2)').classList.add('ativo');
    } else if (telaAtiva === 'relatorio') {
        document.querySelector('.menu-item:nth-child(3)').classList.add('ativo');
    } else if (telaAtiva === 'calendario') {
        document.querySelector('.menu-item:nth-child(4)').classList.add('ativo');
    }
}

// Selecionar categoria no formulário
function selecionarCategoria(categoria) {
    // Remover seleção anterior
    document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('selecionada'));
    
    // Selecionar nova categoria
    const btn = document.querySelector(`[data-categoria="${categoria}"]`);
    btn.classList.add('selecionada');
    document.getElementById('categoriaSelecionada').value = categoria;
}

// Registrar gasto
function registrarGasto(event) {
    event.preventDefault();
    
    const categoria = document.getElementById('categoriaSelecionada').value;
    const valor = parseFloat(document.getElementById('valorGasto').value);
    const descricao = document.getElementById('descricaoGasto').value;
    const pagamento = document.querySelector('input[name="pagamento"]:checked').value;
    
    if (!categoria || !valor || !descricao || !pagamento) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Criar objeto do gasto
    const gasto = {
        id: Date.now(),
        data: getDataAtual(),
        categoria,
        valor,
        descricao,
        pagamento,
        timestamp: new Date().toISOString()
    };
    
    // Adicionar aos dados
    dadosApp.gastos.push(gasto);
    
    // Reiniciar contador de dias consecutivos
    configApp.diasConsecutivos = 0;
    
    // Salvar dados
    salvarDados(dadosApp, configApp);
    
    // Mostrar confirmação
    mostrarNotificacao('Gasto registrado com sucesso! 💸');
    
    // Voltar para tela principal
    voltarPrincipal();
}

// Atualizar relatório
let dataRelatorioAtual = getDataAtual();

function atualizarRelatorio() {
    const gastosDia = dadosApp.gastos.filter(g => g.data === dataRelatorioAtual);
    const total = gastosDia.reduce((soma, g) => soma + g.valor, 0);
    
    // Atualizar data
    document.getElementById('dataRelatorio').textContent = formatarData(dataRelatorioAtual);
    
    // Atualizar total
    document.getElementById('totalRelatorio').textContent = `R$ ${total.toFixed(2)}`;
    
    // Categoria mais gasta
    if (gastosDia.length > 0) {
        const categoriasContagem = {};
        gastosDia.forEach(g => {
            categoriasContagem[g.categoria] = (categoriasContagem[g.categoria] || 0) + g.valor;
        });
        
        const categoriaMaisGasta = Object.keys(categoriasContagem).reduce((a, b) => 
            categoriasContagem[a] > categoriasContagem[b] ? a : b
        );
        
        document.getElementById('categoriaRelatorio').textContent = 
            dadosApp.categorias[categoriaMaisGasta].nome;
    } else {
        document.getElementById('categoriaRelatorio').textContent = '-';
    }
    
    // Forma de pagamento mais usada
    if (gastosDia.length > 0) {
        const pagamentosContagem = {};
        gastosDia.forEach(g => {
            pagamentosContagem[g.pagamento] = (pagamentosContagem[g.pagamento] || 0) + 1;
        });
        
        const pagamentoMaisUsado = Object.keys(pagamentosContagem).reduce((a, b) => 
            pagamentosContagem[a] > pagamentosContagem[b] ? a : b
        );
        
        document.getElementById('pagamentoRelatorio').textContent = 
            pagamentoMaisUsado.charAt(0).toUpperCase() + pagamentoMaisUsado.slice(1);
    } else {
        document.getElementById('pagamentoRelatorio').textContent = '-';
    }
    
    // Lista de gastos
    const listaRelatorio = document.getElementById('listaRelatorio');
    
    if (gastosDia.length === 0) {
        listaRelatorio.innerHTML = `
            <div class="sem-gastos-relatorio">
                <i class="fas fa-chart-line"></i>
                <p>Nenhum gasto registrado nesta data</p>
            </div>
        `;
        return;
    }
    
    listaRelatorio.innerHTML = gastosDia.map(gasto => {
        const categoria = dadosApp.categorias[gasto.categoria];
        return `
            <div class="gasto-item-relatorio">
                <div class="gasto-info-relatorio">
                    <div class="gasto-categoria-relatorio" style="background: ${categoria.cor};">
                        <i class="${categoria.icone}"></i>
                    </div>
                    <div>
                        <h4>${categoria.nome}</h4>
                        <p>${gasto.descricao}</p>
                        <small>${gasto.pagamento}</small>
                    </div>
                </div>
                <div class="gasto-valor-relatorio">
                    R$ ${gasto.valor.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Mudar data do relatório
function mudarDataRelatorio(direcao) {
    const data = new Date(dataRelatorioAtual);
    data.setDate(data.getDate() + direcao);
    dataRelatorioAtual = data.toISOString().split('T')[0];
    atualizarRelatorio();
}

// Compartilhar relatório
function compartilharRelatorio() {
    const gastosDia = dadosApp.gastos.filter(g => g.data === dataRelatorioAtual);
    const total = gastosDia.reduce((soma, g) => soma + g.valor, 0);
    
    let texto = `📊 Relatório de Gastos - ${formatarData(dataRelatorioAtual)}\n\n`;
    texto += `Total: R$ ${total.toFixed(2)}\n\n`;
    
    if (gastosDia.length > 0) {
        texto += "Gastos do dia:\n";
        gastosDia.forEach(g => {
            const cat = dadosApp.categorias[g.categoria];
            texto += `• ${cat.nome}: R$ ${g.valor.toFixed(2)} (${g.pagamento})\n`;
        });
    } else {
        texto += "✅ Nenhum gasto registrado!\n";
    }
    
    texto += "\n#ZeroGastos #ControleFinanceiro";
    
    if (navigator.share) {
        navigator.share({
            title: `Relatório de Gastos - ${formatarData(dataRelatorioAtual)}`,
            text: texto
        });
    } else {
        // Fallback: copiar para área de transferência
        navigator.clipboard.writeText(texto)
            .then(() => mostrarNotificacao('Relatório copiado para a área de transferência! 📋'))
            .catch(() => alert(texto));
    }
}

// Ver dia específico no calendário
function verDia(dia) {
    const hoje = new Date();
    const dataStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    dataRelatorioAtual = dataStr;
    mostrarRelatorio();
}

// Configurar event listeners para opções de pagamento
document.addEventListener('DOMContentLoaded', function() {
    // Configurar seleção de opções de pagamento
    document.querySelectorAll('.pagamento-option').forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        option.addEventListener('click', () => {
            // Remover seleção anterior
            document.querySelectorAll('.pagamento-option').forEach(opt => opt.classList.remove('selecionada'));
            
            // Selecionar nova opção
            option.classList.add('selecionada');
            radio.checked = true;
        });
    });
    
    // Inicializar aplicativo quando a página carregar
    inicializarApp();
});