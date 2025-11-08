// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite que o frontend acesse o backend
app.use(express.json()); // Permite que o servidor entenda JSON
// Serve os arquivos estáticos relativos ao arquivo server.js (garante funcionamento mesmo quando o processo é iniciado na raiz do repo)
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz explícita — garante que index.html seja servido mesmo que o static não responda por algum motivo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Simulação de um Banco de Dados (fallback) ---
let agendamentos = [
    // { nome: "João Silva", telefone: "11999998888", data: "2025-10-31", hora: "10:00" }
];

// --- Configuração da Barbearia ---
const horariosDeTrabalho = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

// --- PostgreSQL (opcional) ---
const DATABASE_URL = process.env.DATABASE_URL; // ex: postgres://user:pass@host:port/dbname
let pool = null;
let useDb = false;

async function initDb() {
    if (!DATABASE_URL) return;
    // Em muitos provedores (Railway, Render) é necessário usar SSL com rejectUnauthorized: false
    pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    useDb = true;
    // Cria tabela se não existe
    await pool.query(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            telefone TEXT NOT NULL,
            data_agendamento DATE NOT NULL,
            hora TIME NOT NULL
        )
    `);
}

// Inicializa a conexão com o banco (se DATABASE_URL estiver setada)
initDb().catch(err => {
    console.error('Erro ao inicializar DB:', err.message || err);
    useDb = false;
});

// === ROTAS DA API ===

// Rota para o CLIENTE ver os horários disponíveis em uma data
app.get('/api/horarios-disponiveis', async (req, res) => {
    const { data } = req.query; // ex: ?data=2025-10-31

    try {
        let horariosOcupados = [];

        if (useDb && pool) {
            const result = await pool.query('SELECT hora FROM agendamentos WHERE data_agendamento = $1', [data]);
            horariosOcupados = result.rows.map(r => {
                // r.hora pode vir como 'HH:MM:SS', cortamos para 'HH:MM'
                return r.hora.toString().slice(0,5);
            });
        } else {
            const agendamentosNaData = agendamentos.filter(ag => ag.data === data);
            horariosOcupados = agendamentosNaData.map(ag => ag.hora);
        }

        const horariosDisponiveis = horariosDeTrabalho.filter(horario => !horariosOcupados.includes(horario));
        res.json(horariosDisponiveis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar horários' });
    }
});

// Rota para o CLIENTE criar um novo agendamento
app.post('/api/agendar', async (req, res) => {
    const { nome, telefone, data, hora } = req.body;

    try {
        if (useDb && pool) {
            await pool.query(
                'INSERT INTO agendamentos (nome, telefone, data_agendamento, hora) VALUES ($1, $2, $3, $4)',
                [nome, telefone, data, hora]
            );
            res.status(201).json({ message: 'Agendamento realizado com sucesso!' });
        } else {
            agendamentos.push({ nome, telefone, data, hora });
            console.log('Agendamentos atuais (mem):', agendamentos);
            res.status(201).json({ message: 'Agendamento realizado com sucesso (memória)!' });
        }
    } catch (err) {
        console.error('Erro ao inserir agendamento:', err);
        res.status(500).json({ error: 'Erro ao salvar agendamento' });
    }
});

// Rota para o BARBEIRO ver a lista de agendamentos de um dia
app.get('/api/agendamentos', async (req, res) => {
    const { data } = req.query;

    try {
        if (useDb && pool) {
            const result = await pool.query(
                'SELECT nome, telefone, data_agendamento AS data, hora FROM agendamentos WHERE data_agendamento = $1 ORDER BY hora',
                [data]
            );
            // Formatar hora para HH:MM
            const rows = result.rows.map(r => ({
                nome: r.nome,
                telefone: r.telefone,
                data: r.data.toISOString().slice(0,10),
                hora: r.hora.toString().slice(0,5)
            }));
            res.json(rows);
        } else {
            const agendamentosDoDia = agendamentos
                .filter(ag => ag.data === data)
                .sort((a, b) => a.hora.localeCompare(b.hora));
            res.json(agendamentosDoDia);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
    if (useDb) console.log('Conectado ao PostgreSQL via DATABASE_URL');
    else console.log('Banco não configurado (usando memória). Para ativar, defina DATABASE_URL.');
});