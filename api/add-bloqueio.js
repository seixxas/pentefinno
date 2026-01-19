import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { date, time } = req.body;
    const sql = neon(process.env.DATABASE_URL);

    try {
        // Insere o bloqueio no banco de dados
        // Importante: a tabela 'bloqueios' deve existir no seu Neon
        await sql`
            INSERT INTO bloqueios (data, horario)
            VALUES (${date}, ${time})
        `;

        return res.status(200).json({ message: 'Bloqueio realizado com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao salvar o bloqueio no banco de dados.' });
    }
}