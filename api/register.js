import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { name, email, phone, password } = req.body;
    const sql = neon(process.env.DATABASE_URL);

    try {
        // Insere o usuário no banco
        await sql`
            INSERT INTO users (name, email, phone, password) 
            VALUES (${name}, ${email}, ${phone}, ${password})
        `;
        return res.status(200).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error(error);
        if (error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'E-mail já cadastrado.' });
        }
        return res.status(500).json({ error: 'Erro ao criar conta.' });
    }
}