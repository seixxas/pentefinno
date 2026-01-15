const WHATSAPP_NUMBER = "5511959296268";
const WHATSAPP_API_URL = "https://wa.me/";

// --- NOVO: Lógica do Carrinho ---
let carrinho = [];

// --- Mantendo seu Scroll Suave ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- Lógica de Seleção de Serviço (CARRINHO) ---
document.querySelectorAll('.select-service-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (!listItem) return;

        const nomeServico = listItem.getAttribute('data-service');
        const precoTexto = listItem.querySelector('.price-tag').textContent;
        const precoValor = parseInt(precoTexto.replace(/\D/g, ''));

        // Adiciona ao array do carrinho
        carrinho.push({ nome: nomeServico, preco: precoValor });

        atualizarInterfaceCarrinho();
    });
});

function atualizarInterfaceCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho-servicos');
    const listaUl = document.getElementById('lista-carrinho');
    const totalSpan = document.getElementById('total-carrinho');

    if (carrinho.length > 0) {
        carrinhoDiv.classList.remove('d-none');
    } else {
        carrinhoDiv.classList.add('d-none');
        document.getElementById('agendamento').classList.add('d-none');
    }

    listaUl.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        listaUl.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                <div>
                    <i class="bi bi-check2-circle text-success me-2"></i>
                    <strong>${item.nome}</strong>
                </div>
                <div>
                    <span class="badge bg-light text-dark me-2 service-card">R$ ${item.preco} </span>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="removerDoCarrinho(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </li>`;
    });

    totalSpan.textContent = total;
}

// Função global para remover item
window.removerDoCarrinho = (index) => {
    carrinho.splice(index, 1);
    atualizarInterfaceCarrinho();
};

// Botão para abrir a aba de agendamento
document.getElementById('abrir-agendamento-btn').addEventListener('click', () => {
    const agendamentoSection = document.getElementById('agendamento');
    const resumo = document.getElementById('servicos-resumo');
    
    // Preenche o resumo no form
    const listaNomes = carrinho.map(s => s.nome).join(", ");
    const total = carrinho.reduce((acc, s) => acc + s.preco, 0);
    resumo.innerHTML = `<strong>${listaNomes}</strong> (Total: R$ ${total})`;

    agendamentoSection.classList.remove('d-none');
    agendamentoSection.scrollIntoView({ behavior: 'smooth' });
    
    // Habilita o botão final apenas se houver horário
    checkFormStatus();
});

// --- Lógica de Datas e Horários (Sua lógica com Botões) ---
const dataInput = document.getElementById('data-agendamento');
const inputOcultoHorario = document.getElementById('horario-agendamento');

const today = new Date();
const minDate = today.toISOString().split('T')[0];
dataInput.setAttribute('min', minDate);

const HORARIOS_DISPONIVEIS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

async function loadHorarios() {
    const selectedDate = dataInput.value;
    const container = document.getElementById('container-horarios');

    if (!selectedDate) return;

    container.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
    inputOcultoHorario.value = ""; 
    checkFormStatus();

    try {
        const response = await fetch(`/api/agendar?date=${selectedDate}`);
        const horariosOcupados = await response.json();

        container.innerHTML = ""; 

        HORARIOS_DISPONIVEIS.forEach(horario => {
            const btn = document.createElement('button');
            btn.type = "button"; 
            btn.className = "time-slot";
            btn.textContent = horario;

            if (horariosOcupados.includes(horario)) {
                btn.classList.add('disabled');
                btn.disabled = true;
            } else {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    inputOcultoHorario.value = horario;
                    checkFormStatus();
                });
            }
            container.appendChild(btn);
        });

    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = "<p class='text-danger'>Erro ao carregar horários.</p>";
    }
}

dataInput.addEventListener('change', loadHorarios);

// Libera o botão de finalizar se o horário for escolhido
function checkFormStatus() {
    const btnFinalizar = document.getElementById('finalizar-agendamento-btn');
    btnFinalizar.disabled = (inputOcultoHorario.value === "");
}

// --- Lógica de Envio (Banco + WhatsApp com Múltiplos Serviços) ---
document.getElementById('agendamento-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome-completo').value;
    const email = document.getElementById('email-cliente').value;
    const barbeiro = document.getElementById('barbeiro-selecionado').value;
    const data = dataInput.value;
    const horario = inputOcultoHorario.value;
    const servicosTexto = carrinho.map(s => s.nome).join(", ");
    const totalFinanceiro = carrinho.reduce((acc, s) => acc + s.preco, 0);

    let telefone = document.getElementById('telefone').value;
    telefone = telefone.replace(/\D/g, '');

    if (carrinho.length === 0 || !nome || !horario) {
        alert("Por favor, selecione serviços e horário.");
        return;
    }

    // --- SALVANDO NO BANCO ---
    try {
        await fetch('/api/agendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                barber: barbeiro,
                service: `${servicosTexto} (R$ ${totalFinanceiro})`,
                date: data,
                time: horario
            })
        });
    } catch (error) {
        console.error("Erro no banco:", error);
    }

    // --- MENSAGEM WHATSAPP ---
    const dateObj = new Date(data + 'T00:00:00');
    const dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const mensagem = `Olá! Meu nome é ${nome}. 
    Agendamento solicitado:
    *Serviços:* ${servicosTexto}
    *Total:* R$ ${totalFinanceiro}
    *Profissional:* ${barbeiro}
    *Data:* ${dataFormatada} às ${horario}
    *Telefone:* ${telefone}`;

    const finalUrl = `${WHATSAPP_API_URL}${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;

    window.open(finalUrl, '_blank');

    // Reset total
    this.reset();
    carrinho = [];
    atualizarInterfaceCarrinho();
    inputOcultoHorario.value = "";
});