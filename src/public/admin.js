// public/admin.js
document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('data-agendamentos');
    const listaAgendamentos = document.getElementById('lista-agendamentos');
    const contador = document.getElementById('contador-agendamentos');

    async function buscarAgendamentos() {
        const data = inputData.value;
        if (!data) return;

        listaAgendamentos.innerHTML = '<li>Carregando...</li>';

        try {
            const response = await fetch(`http://localhost:3000/api/agendamentos?data=${data}`);
            const agendamentos = await response.json();

            listaAgendamentos.innerHTML = '';
            contador.textContent = `(${agendamentos.length})`;
            if (agendamentos.length === 0) {
                listaAgendamentos.innerHTML = '<li>Nenhum agendamento para esta data.</li>';
                return;
            }

            agendamentos.forEach(ag => {
                const item = document.createElement('li');
                // Formata hora e telefone para exibição desejada
                const hora = ag.hora ? ag.hora.replace(/\[|\]/g, '') : '';
                const telefoneFormatado = formatPhone(ag.telefone || '');
                item.textContent = `${hora} - ${ag.nome} - Tel: ${telefoneFormatado}`;
                listaAgendamentos.appendChild(item);
            });

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            listaAgendamentos.innerHTML = '<li>Erro ao carregar agendamentos.</li>';
        }
    }

    inputData.addEventListener('change', buscarAgendamentos);
});

// Formata números de telefone brasileiros
function formatPhone(raw) {
    // Remove qualquer caractere não numérico
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 11) {
        // (AA) 9XXXX-XXXX
        return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
        // (AA) XXXX-XXXX
        return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    } else if (digits.length > 2) {
        // Fallback parcial: (AA) rest
        return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    }
    return raw;
}