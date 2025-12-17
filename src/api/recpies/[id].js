// Deprecated duplicate endpoint. Use `pages/api/recipes/[id].js` instead.
export default function handler(req, res) {
  res.status(410).json({ error: 'Deprecated API location. Use /api/recipes/[id].' });
}
