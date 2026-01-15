import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // --- LÓGICA PARA BUSCAR HORÁRIOS OCUPADOS (GET) ---
  if (req.method === 'GET') {
    const { date } = req.query;
    try {
      const result = await sql`SELECT time FROM appointments WHERE date = ${date}`;
      const ocupados = result.map(row => row.time.substring(0, 5));
      return res.status(200).json(ocupados);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- LÓGICA PARA SALVAR (POST) ---
  if (req.method === 'POST') {
    // Adicionamos name e phone aqui na desestruturação
    const { name, email, phone, barber, service, date, time } = req.body;
    
    try {
      await sql`
        INSERT INTO appointments (name, user_email, phone, barber, service, date, time)
        VALUES (${name}, ${email}, ${phone}, ${barber}, ${service}, ${date}, ${time})
      `;
      return res.status(200).json({ message: 'Salvo com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}