import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);
    try {
        // Mudando de agendamentos para appointments
        const agendamentos = await sql`
            SELECT * FROM appointments 
            ORDER BY date ASC, time ASC
        `;
        return res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro no Banco:", error);
        return res.status(500).json({ error: error.message });
    }
}
