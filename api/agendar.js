import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // --- LOGICA PARA BUSCAR HORÁRIOS OCUPADOS ---
  if (req.method === 'GET') {
    const { date } = req.query;
    try {
      // Busca apenas os horários já agendados para a data selecionada
      const result = await sql`SELECT time FROM appointments WHERE date = ${date}`;
      // Formata os horários para o JS entender (ex: "09:00:00" -> "09:00")
      const ocupados = result.map(row => row.time.substring(0, 5));
      return res.status(200).json(ocupados);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- LOGICA PARA SALVAR (VOCÊ JÁ TINHA) ---
  if (req.method === 'POST') {
    const { email, barber, service, date, time } = req.body;
    try {
      await sql`
        INSERT INTO appointments (user_email, barber, service, date, time)
        VALUES (${email}, ${barber}, ${service}, ${date}, ${time})
      `;
      return res.status(200).json({ message: 'Salvo!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}