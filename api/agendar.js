import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    const { email, barber, service, date, time } = req.body;

    try {
      await sql`
        INSERT INTO appointments (user_email, barber, service, date, time)
        VALUES (${email}, ${barber}, ${service}, ${date}, ${time})
      `;
      return res.status(200).json({ message: 'Salvo no banco!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}