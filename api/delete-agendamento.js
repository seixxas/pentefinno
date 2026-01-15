import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') return res.status(405).end();

    const { id } = req.body;
    const sql = neon(process.env.DATABASE_URL);

    try {
        await sql`DELETE FROM appointments WHERE id = ${id}`;
        return res.status(200).json({ message: 'Cancelado com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar' });
    }
}