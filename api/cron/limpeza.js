import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Segurança: Verifica se a requisição vem da própria Vercel (Cron)
    // Isso evita que qualquer pessoa acesse a URL e apague seus dados
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Não autorizado');
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Deleta agendamentos onde a data é menor que a data atual (Hoje)
        const result = await sql`
            DELETE FROM agendamentos 
            WHERE date < CURRENT_DATE
        `;

        console.log(`Limpeza concluída. Agendamentos removidos.`);
        return res.status(200).json({ 
            message: 'Limpeza realizada com sucesso', 
            deletedCount: result.length 
        });
    } catch (error) {
        console.error('Erro na limpeza:', error);
        return res.status(500).json({ error: 'Falha ao processar limpeza' });
    }
}