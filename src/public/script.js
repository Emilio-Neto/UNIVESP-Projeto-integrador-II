// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('data-selecionada');
    const horariosContainer = document.getElementById('horarios-container');
    const formCliente = document.getElementById('formulario-cliente');
    const nomeClienteInput = document.getElementById('nome-cliente');
    const telefoneClienteInput = document.getElementById('telefone-cliente');
    const btnConfirmar = document.getElementById('btn-confirmar-agendamento');
    const horarioSelecionadoTexto = document.getElementById('horario-selecionado-texto');

    let dataSelecionada;
    let horarioSelecionado;

    // Começa com botão desabilitado até que telefone válido e nome preenchido
    btnConfirmar.disabled = true;

    // Função para buscar e exibir horários
    async function buscarHorarios() {
        dataSelecionada = inputData.value;
        if (!dataSelecionada) return;

        // Limpa a visualização anterior
        horariosContainer.innerHTML = 'Carregando...';
        formCliente.classList.add('hidden');

        try {
            const response = await fetch(`http://localhost:3000/api/horarios-disponiveis?data=${dataSelecionada}`);
            const horarios = await response.json();

            horariosContainer.innerHTML = '';
            if (horarios.length === 0) {
                horariosContainer.innerHTML = '<p>Nenhum horário disponível para esta data.</p>';
                return;
            }

            horarios.forEach(hora => {
                const btn = document.createElement('button');
                btn.className = 'horario-btn';
                btn.textContent = hora;
                btn.onclick = () => {
                    horarioSelecionado = hora;
                    horarioSelecionadoTexto.textContent = `${formatDateDisplay(dataSelecionada)} às ${hora}`;
                    formCliente.classList.remove('hidden');
                    updateConfirmButtonState();
                };
                horariosContainer.appendChild(btn);
            });
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
            horariosContainer.innerHTML = '<p>Erro ao carregar horários. Tente novamente.</p>';
        }
    }

    // Função para confirmar o agendamento
    async function confirmarAgendamento() {
        const nome = nomeClienteInput.value;
        const telefone = telefoneClienteInput.value;

        if (!nome || !telefone || !dataSelecionada || !horarioSelecionado) {
            alert('Por favor, preencha todos os campos e selecione um horário.');
            return;
        }

        // Validação extra: telefone deve ter pelo menos 10 dígitos (DDD + 8)
        const digits = String(telefone).replace(/\D/g, '');
        if (digits.length < 10) {
            alert('Telefone inválido. Informe o DDD e pelo menos 8 dígitos do número (ex.: (11) 91234-5678).');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    telefone,
                    data: dataSelecionada,
                    hora: horarioSelecionado
                })
            });

            if (response.ok) {
                alert('Agendamento realizado com sucesso!');
                // Limpa o formulário e atualiza os horários
                nomeClienteInput.value = '';
                telefoneClienteInput.value = '';
                formCliente.classList.add('hidden');
                buscarHorarios();
            } else {
                alert('Erro ao agendar. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao agendar:', error);
            alert('Erro de conexão ao agendar.');
        }
    }

    // Adiciona os "escutadores" de eventos
    inputData.addEventListener('change', buscarHorarios);
    btnConfirmar.addEventListener('click', confirmarAgendamento);

    // Aplica máscara de entrada no campo de telefone enquanto o usuário digita
    telefoneClienteInput.addEventListener('input', (e) => {
        const formatted = formatPhoneInput(e.target.value);
        e.target.value = formatted;
        updateConfirmButtonState();
    });

    // Habilita/Desabilita o botão de confirmar baseado na validação do telefone e presença do nome
    nomeClienteInput.addEventListener('input', updateConfirmButtonState);

    function updateConfirmButtonState() {
        const nome = nomeClienteInput.value.trim();
        const telefoneDigits = String(telefoneClienteInput.value).replace(/\D/g, '');
        const telefoneValido = telefoneDigits.length >= 10; // DDD (2) + pelo menos 8
        // também verifica se data e horário já foram selecionados
        const pronto = nome.length > 0 && telefoneValido && dataSelecionada && horarioSelecionado;
        btnConfirmar.disabled = !pronto;
    }
});

// Formata a string enquanto o usuário digita (máscara para BR: (AA) 9XXXX-XXXX ou (AA) XXXX-XXXX)
function formatPhoneInput(value) {
    const digits = String(value).replace(/\D/g, '').slice(0, 11); // máximo 11 dígitos

    if (digits.length === 0) return '';
    if (digits.length <= 2) {
        return `(${digits}`;
    }
    if (digits.length <= 6) {
        return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
        return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    }
    // 11 dígitos
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

// Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY para exibição
function formatDateDisplay(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}