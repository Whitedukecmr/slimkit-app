const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { imageBase64 } = req.body
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
            },
            {
              type: 'text',
              text: `Analyse ce repas et retourne UNIQUEMENT un JSON valide avec ces champs:
{
  "nom_repas": "nom du plat",
  "calories": nombre,
  "proteines_g": nombre,
  "glucides_g": nombre,
  "lipides_g": nombre,
  "fibres_g": nombre,
  "avis_sante": "commentaire nutritionnel en français",
  "conseil": "conseil personnalisé pour perdre du poids en français",
  "score_sante": nombre entre 1 et 10
}`
            }
          ]
        }]
      })
    })
    const data = await response.json()
    const text = data.content.map(b => b.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()
    res.json(JSON.parse(clean))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur analyse' })
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.listen(3001, () => console.log('Backend running on :3001'))
