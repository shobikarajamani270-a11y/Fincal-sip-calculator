import { getPool } from '../../lib/db';

/**
 * API Route: /api/calculate
 * POST — Save a calculation to MySQL (if available)
 * GET  — Fetch calculation history
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      goalType, presentCost, years,
      inflationRate, expectedReturn,
      futureGoal, monthlySIP,
    } = req.body || {};

    if (!presentCost || !years || !futureGoal || !monthlySIP) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Try saving to MySQL if available
    try {
      const pool = await getPool();
      if (pool) {
        await pool.execute(
          `INSERT INTO calculations
           (goal_type, present_cost, years, inflation_rate, expected_return, future_goal, monthly_sip)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [goalType || 'custom', presentCost, years, inflationRate, expectedReturn, futureGoal, monthlySIP]
        );
      }
    } catch {
      // DB not available — calculator still works without it
    }

    return res.status(200).json({
      success: true,
      message: 'Calculation processed successfully',
      data: { goalType, presentCost, years, inflationRate, expectedReturn, futureGoal, monthlySIP },
    });
  }

  if (req.method === 'GET') {
    try {
      const pool = await getPool();
      if (pool) {
        const [rows] = await pool.execute(
          'SELECT * FROM calculations ORDER BY created_at DESC LIMIT 20'
        );
        return res.status(200).json({ success: true, data: rows });
      }
    } catch {
      // DB not available
    }
    return res.status(200).json({ success: true, data: [] });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}