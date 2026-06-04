const express = require('express')
const cors = require('cors')
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))

const bedrock = new BedrockRuntimeClient({ region: 'eu-west-3' })

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { imageBase64 } = req.body
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
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
            text: 'Analyse ce repas et retourne UNIQUEMENT un JSON valide avec ces champs: {"nom_repas": "nom du plat", "calories": nombre, "proteines_g": nombre, "glucides_g": nombre, "lipides_g": nombre, "fibres_g": nombre, "avis_sante": "commentaire en francais", "conseil": "conseil perte de poids en francais", "score_sante": nombre entre 1 et 10}'
          }
        ]
      }]
    }
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-sonnet-4-20250514-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    })
    const response = await bedrock.send(command)
    const body = JSON.parse(Buffer.from(response.body).toString())
    const text = body.content[0].text.replace(/```json|```/g, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.listen(3001, () => console.log('Backend Bedrock :3001'))
