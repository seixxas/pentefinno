const WHATSAPP_NUMBER = "5511959296268"; 
const WHATSAPP_API_URL = "https://wa.me/";

let selectedService = ""; 

// --- Mantendo seu Scroll Suave ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// --- Lógica de Seleção de Serviço (Mantendo sua lógica de visualização) ---
const agendamentoSection = document.getElementById('agendamento');

document.querySelectorAll('.select-service-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (!listItem) return;

        const fullService = listItem.getAttribute('data-service');
        const priceElement = listItem.querySelector('.price-tag');
        const price = priceElement ? priceElement.textContent : '';

        selectedService = `${fullService} (${price})`;

        document.getElementById('servico-selecionado-display').textContent = selectedService;

        // Mantendo sua lógica de mostrar a seção
        agendamentoSection.classList.remove('d-none');
        agendamentoSection.scrollIntoView({ behavior: 'smooth' });

        document.getElementById('finalizar-agendamento-btn').disabled = false;
        document.getElementById('horario-agendamento').disabled = false;
    });
});

// --- Lógica de Datas e Horários (Mantendo suas regras) ---
const dataInput = document.getElementById('data-agendamento');
const horarioSelect = document.getElementById('horario-agendamento');

const today = new Date();
const minDate = today.toISOString().split('T')[0];
dataInput.setAttribute('min', minDate);

const HORARIOS_DISPONIVEIS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

function loadHorarios() {
    horarioSelect.innerHTML = '<option value="" disabled selected>Selecione um horário...</option>';
    const selectedDate = dataInput.value;
    if (!selectedDate) return;

    HORARIOS_DISPONIVEIS.forEach(horario => {
        const option = document.createElement('option');
        option.value = horario;
        option.textContent = horario;
        horarioSelect.appendChild(option);
    });
}

dataInput.addEventListener('change', loadHorarios);

// Mantendo sua função de abrir o seletor nativo
dataInput.addEventListener('click', function() {
    if (this.type === 'date') {
        this.showPicker(); 
    }
});

// --- Lógica de Envio (Banco + Sua mensagem de WhatsApp original) ---
document.getElementById('agendamento-form').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const nome = document.getElementById('nome-completo').value;
    const email = document.getElementById('email-cliente').value; // Novo campo
    const barbeiro = document.getElementById('barbeiro-selecionado').value;
    const data = dataInput.value;
    const horario = horarioSelect.value;
    
    let telefone = document.getElementById('telefone').value; 
    telefone = telefone.replace(/\D/g, ''); 

    // Validação que você já tinha
    if (!selectedService || !nome || !telefone || !barbeiro || !data || !horario) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // --- NOVO: SALVANDO NO BANCO ANTES DO WHATSAPP ---
    try {
        const response = await fetch('/api/agendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                barber: barbeiro,
                service: selectedService,
                date: data,
                time: horario
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar no banco');
        
        console.log("Salvo no banco com sucesso!");

    } catch (error) {
        console.error("Erro no banco:", error);
        // Opcional: avisar o usuário, mas ainda assim tentar abrir o WhatsApp
    }

    // --- SUA LÓGICA ORIGINAL DO WHATSAPP ---
    const dateObj = new Date(data + 'T00:00:00');
    const dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const mensagem = `Olá! Meu nome é ${nome}, estou agendando o serviço *${selectedService}* com o barbeiro *${barbeiro}* para o dia ${dataFormatada} às ${horario}. Meu telefone é ${telefone}. Por favor, confirme a disponibilidade.`;

    const finalUrl = `${WHATSAPP_API_URL}${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;

    window.open(finalUrl, '_blank');

    // Reset que você já tinha
    this.reset();
    document.getElementById('servico-selecionado-display').textContent = "Nenhum";
    selectedService = "";
    document.getElementById('finalizar-agendamento-btn').disabled = true;
    agendamentoSection.classList.add('d-none'); // Esconde a seção após sucesso
});

loadHorarios();