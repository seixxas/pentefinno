import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

    const sql = neon(process.env.DATABASE_URL);

    try {
        const users = await sql`
            SELECT name, email, phone, created_at FROM users 
            ORDER BY name ASC
        `;
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
}