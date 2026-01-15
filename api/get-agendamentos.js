import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Busca todos os agendamentos ordenados por data e hora
        const agendamentos = await sql`
            SELECT * FROM agendamentos 
            ORDER BY date ASC, time ASC
        `;
        return res.status(200).json(agendamentos);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar agenda' });
    }
}