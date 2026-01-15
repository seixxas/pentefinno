import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { loginId, password } = req.body; // loginId pode ser email ou celular
    const sql = neon(process.env.DATABASE_URL);

    try {
        // Busca usuário por email ou telefone
        const result = await sql`
            SELECT id, name, email, phone, password FROM users 
            WHERE (email = ${loginId} OR phone = ${loginId}) 
            AND password = ${password} 
            LIMIT 1
        `;

        if (result.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Retorna os dados do usuário (menos a senha)
        const user = result[0];
        delete user.password;

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao fazer login.' });
    }
}