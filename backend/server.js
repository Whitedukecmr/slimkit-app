const express = require('express')
const cors = require('cors')
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '20mb' }))

const bedrock = new BedrockRuntimeClient({ region: 'eu-west-3' })

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { imageBase64 } = req.body

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image manquante' })
    }

    // Détecter le type MIME réel de l'image
    let mediaType = 'image/jpeg'
    if (imageBase64.startsWith('/9j/')) mediaType = 'image/jpeg'
    else if (imageBase64.startsWith('iVBOR')) mediaType = 'image/png'
    else if (imageBase64.startsWith('R0lGO')) mediaType = 'image/gif'
    else if (imageBase64.startsWith('UklGR')) mediaType = 'image/webp'

    console.log(`Analyse image - type: ${mediaType}, taille: ${imageBase64.length} chars`)

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: 'Analyse ce repas et retourne UNIQUEMENT un JSON valide sans backticks avec ces champs: {"nom_repas": "nom du plat", "calories": nombre, "proteines_g": nombre, "glucides_g": nombre, "lipides_g": nombre, "fibres_g": nombre, "avis_sante": "commentaire en francais", "conseil": "conseil perte de poids en francais", "score_sante": nombre entre 1 et 10}'
          }
        ]
      }]
    }

    const command = new InvokeModelCommand({
      modelId: 'eu.anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    })

    const response = await bedrock.send(command)
    const body = JSON.parse(Buffer.from(response.body).toString())
    console.log('Réponse Bedrock reçue')

    const text = body.content[0].text.replace(/```json|```/g, '').trim()
    console.log('Texte brut:', text.substring(0, 100))

    const result = JSON.parse(text)
    res.json(result)

  } catch (err) {
    console.error('Erreur complète:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.listen(3001, () => console.log('Backend Bedrock :3001'))
