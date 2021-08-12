const fastify = require('fastify')
const path = require('path')
const autoload = require('fastify-autoload')

const { SESClient } = require('@aws-sdk/client-ses')
const { SendTemplatedEmailCommand,
  GetTemplateCommand, 
  CreateTemplateCommand } = require('@aws-sdk/client-ses')
const { fromIni } = require('@aws-sdk/credential-provider-ini')
const REGION = 'eu-central-1'

const sesClient = new SESClient({
  credentials: fromIni({ profile: 'default' }),
  region: REGION
})

const paramsForTemplatedEmail = {
  Destination: {
    CcAddresses: [
      /* more CC email addresses */
    ],
    ToAddresses: [
      'kingfisher@example.imap.cc' // RECEIVER_ADDRESS
    ]
  },
  Source: 'nightjar@example.imap.cc', // SENDER_ADDRESS
  Template: 'MigrationConfirmation', // TEMPLATE_NAME
  TemplateData: '{ "name":"Alaric", "location": "Mexico" }' /* required */,
  ReplyToAddresses: []
}

const paramsForTemplateCreation = {
  Template: {
    TemplateName: 'MigrationConfirmation',
    HtmlPart: "<h1>Hello {{name}},</h1><p>You are confirmed for the winter migration to <a href='https://en.wikipedia.org/wiki/{{location}}'>{{location}}</a>.</p>",
    SubjectPart: 'Get ready for your journey, {{name}}!',
    TextPart: "Dear {{name}},\r\nYou are confirmed for the winter migration to <a href='https://en.wikipedia.org/wiki/{{location}}'>{{location}}</a>"
  }
}

async function sendTemplatedEmail (params) {
  try {
    const data = await sesClient.send(new SendTemplatedEmailCommand(params))
    console.log('Success.', data)
    return data // For unit tests.
  } catch (err) {
    console.log('Error', err.stack)
  }
}

async function createTemplate (params) {
  try {
    const data = await sesClient.send(new CreateTemplateCommand(params))
    console.log('Success', data)
  } catch (err) {
    console.log('Error', err.stack)
  }
}

async function createTemplateIfNotExists (params) {
  try {
    let queryParams = { TemplateName: params.Template.TemplateName }
    let templateExists = await sesClient.send(new GetTemplateCommand(queryParams))
  } catch (err) {
    createTemplate(params)
  }
}

const app = fastify({ logger: true })

app.post('/notify', async (req, res) => {
  const { userId, event, params } = req.body
  switch (event) {
    case 'migration-confirmed':
      sendTemplatedEmail(paramsForTemplatedEmail)
      res.send('migration-confirmed email sent')
      break
    default:
      res.send('event not configured')
  }
})

createTemplateIfNotExists(paramsForTemplateCreation);

const server = app.listen(3000, () => console.log('🚀 Server ready at: http://localhost:3000'))
