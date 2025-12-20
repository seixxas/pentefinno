const WHATSAPP_NUMBER = "5511967519320"; // Substitua pelo número real da barbearia (Formato: 55DDDNUMERO)
const WHATSAPP_API_URL = "https://wa.me/";

let selectedService = ""; // Variável para armazenar o serviço escolhido

// Função para fazer o Scroll Suave (Melhora a navegação)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// --- Lógica de Seleção de Serviço ---
document.querySelectorAll('.select-service-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        // Encontra o item da lista (<li>) pai, onde está o atributo data-service
        const listItem = e.target.closest('li');
        if (!listItem) return;

        // Pega o nome do serviço a partir do atributo de dados
        const fullService = listItem.getAttribute('data-service');
        const priceElement = listItem.querySelector('.price-tag');
        const price = priceElement ? priceElement.textContent : '';

        selectedService = `${fullService} (${price})`;

        // Atualiza o display no formulário
        document.getElementById('servico-selecionado-display').textContent = selectedService;

        // Rola suavemente para a seção de agendamento
        document.querySelector('#agendamento').scrollIntoView({
            behavior: 'smooth'
        });

        // Habilita o formulário
        document.getElementById('finalizar-agendamento-btn').disabled = false;
        document.getElementById('horario-agendamento').disabled = false;
    });
});

const agendamentoSection = document.getElementById('agendamento');

document.querySelectorAll('.select-service-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        // Encontra o item da lista (<li>) pai, onde está o atributo data-service
        const listItem = e.target.closest('li');
        if (!listItem) return;

        // Pega o nome do serviço a partir do atributo de dados
        const fullService = listItem.getAttribute('data-service');
        const priceElement = listItem.querySelector('.price-tag');
        const price = priceElement ? priceElement.textContent : '';

        selectedService = `${fullService} (${price})`;

        // Atualiza o display no formulário
        document.getElementById('servico-selecionado-display').textContent = selectedService;

        // **PASSO NOVO: 1. Torna a seção de agendamento visível**
        agendamentoSection.classList.remove('d-none');

        // **PASSO NOVO: 2. Rola suavemente para a seção de agendamento**
        agendamentoSection.scrollIntoView({
            behavior: 'smooth'
        });

        // Habilita o formulário
        document.getElementById('finalizar-agendamento-btn').disabled = false;
        document.getElementById('horario-agendamento').disabled = false;
    });
});

// --- Lógica de Datas e Horários ---
const dataInput = document.getElementById('data-agendamento');
const horarioSelect = document.getElementById('horario-agendamento');

// 1. Configura a data mínima para HOJE
const today = new Date();
const minDate = today.toISOString().split('T')[0];
dataInput.setAttribute('min', minDate);

// 2. Horários base (pode ser ajustado)
const HORARIOS_DISPONIVEIS = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
];

// 3. Função para preencher o <select> de horários
function loadHorarios() {
    horarioSelect.innerHTML = '<option value="" disabled selected>Selecione um horário...</option>';

    // Filtro simples (pode ser expandido no futuro para verificar dias da semana)
    const selectedDate = dataInput.value;
    if (!selectedDate) return;

    HORARIOS_DISPONIVEIS.forEach(horario => {
        const option = document.createElement('option');
        option.value = horario;
        option.textContent = horario;
        horarioSelect.appendChild(option);
    });
}

// Recarrega os horários toda vez que a data é alterada
dataInput.addEventListener('change', loadHorarios);


dataInput.addEventListener('click', function() {
    // Verifica se o campo é um input de tipo 'date' e o ativa
    if (this.type === 'date') {
        this.showPicker(); // Método nativo para abrir o seletor (compatibilidade depende do navegador)
    }
});
// --- Lógica de Envio para WhatsApp ---
document.getElementById('agendamento-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    const nome = document.getElementById('nome-completo').value;
    
    // Captura o valor e usa REGEX para remover tudo que não for dígito.
    let telefone = document.getElementById('telefone').value; 
    telefone = telefone.replace(/\D/g, ''); // Limpa: remove espaços, traços, parênteses, etc.
    
    // Captura do barbeiro selecionado
    const barbeiro = document.getElementById('barbeiro-selecionado').value;

    const data = dataInput.value;
    const horario = horarioSelect.value;

    // Validação básica (agora incluindo o barbeiro)
    if (!selectedService || !nome || !telefone || !barbeiro || !data || !horario) {
        alert("Por favor, preencha todos os campos do agendamento, incluindo a escolha do Barbeiro.");
        return;
    }

    // Formatação da data
    const dateObj = new Date(data + 'T00:00:00');
    const dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Mensagem pronta para o WhatsApp (AGORA INCLUINDO O BARBEIRO)
    const mensagem = `Olá! Meu nome é ${nome}, estou agendando o serviço *${selectedService}* com o barbeiro *${barbeiro}* para o dia ${dataFormatada} às ${horario}. Meu telefone é ${telefone}. Por favor, confirme a disponibilidade.`;

    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(mensagem);

    // URL final do WhatsApp
    const finalUrl = `${WHATSAPP_API_URL}${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Abre o link do WhatsApp
    window.open(finalUrl, '_blank');

    // Opcional: Limpar o formulário após o envio
    this.reset();
    document.getElementById('servico-selecionado-display').textContent = "Nenhum";
    selectedService = "";
    document.getElementById('finalizar-agendamento-btn').disabled = true;
});

// Inicializa a carga de horários ao carregar a página (se houver data padrão, o que não é o caso aqui)
loadHorarios();