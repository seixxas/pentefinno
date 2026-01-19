import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const { date } = req.query;
    const sql = neon(process.env.DATABASE_URL);

    try {
        const bloqueios = await sql`
            SELECT horario FROM bloqueios 
            WHERE data = ${date}
        `;
        // Retorna apenas a lista de horários bloqueados, ex: ["14:00", "DIA_TODO"]
        res.status(200).json(bloqueios.map(b => b.horario));
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar bloqueios" });
    }
}