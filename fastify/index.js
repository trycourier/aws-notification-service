const fastify = require('fastify')
const path = require('path')
const autoload = require('fastify-autoload')
// const { PrismaClient } = require('@prisma/client')
// Import required AWS SDK clients and commands for Node.js
const { SESClient } = require("@aws-sdk/client-ses")
const { SendEmailCommand } = require("@aws-sdk/client-ses")
const { fromIni }  = require("@aws-sdk/credential-provider-ini")
// Set the AWS Region.
const REGION = "eu-central-1"; //e.g. "us-east-1"
// Create SES service object.
const sesClient = new SESClient({ 
	credentials: fromIni({profile: 'default'}),
	region: REGION });

const paramsForNormalEmail = {
  Destination: {
    /* required */
    CcAddresses: [
      /* more items */
    ],
    ToAddresses: [
      "ababentsov.de@gmail.com", //RECEIVER_ADDRESS
      /* more To-email addresses */
    ],
  },
  Message: {
    /* required */
    Body: {
      /* required */
      Html: {
        Charset: "UTF-8",
        Data: "HTML_FORMAT_BODY",
      },
      Text: {
        Charset: "UTF-8",
        Data: "TEXT_FORMAT_BODY",
      },
    },
    Subject: {
      Charset: "UTF-8",
      Data: "Email from fastify",
    },
  },
  Source: "ababentsov@gmail.com", // SENDER_ADDRESS
  ReplyToAddresses: [
    /* more items */
  ],
};

const paramsForTemplateEmail = {
  Destination: {
    /* required */
    CcAddresses: [
      /* more CC email addresses */
    ],
    ToAddresses: [
      "kingfisher@example.imap.cc", // RECEIVER_ADDRESS
      /* more To-email addresses */
    ],
  },
  Source: "nightjar@example.imap.cc", //SENDER_ADDRESS
  Template: "MigrationConfirmation", // TEMPLATE_NAME
  TemplateData: '{ "name":"Alaric", "location": "Mexico" }' /* required */,
  ReplyToAddresses: [],
};

const paramsForTemplateCreation = {
  Template: {
    TemplateName: "MigrationConfirmation",
    HtmlPart: "<h1>Hello {{name}},</h1><p>You are confirmed for the winter migration to <a href='https://en.wikipedia.org/wiki/{{location}}'>{{location}}</a>.</p>",
    SubjectPart: "Get ready for your journey, {{name}}!",
    TextPart: "Dear {{name}},\r\nYou are confirmed for the winter migration to <a href='https://en.wikipedia.org/wiki/{{location}}'>{{location}}</a>",
  },
};


async function sendEmail(params) {
  try {
    const data = await sesClient.send(new SendEmailCommand(params));
    console.log("Success", data);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
};

async function sendTemplateEmail(params) {
	try {
		const data = await sesClient.send(new SendTemplatedEmailCommand(params));
		console.log("Success.", data);
		return data; // For unit tests.
	} catch (err) {
		console.log("Error", err.stack);
	}
}

async function createTemplate(params) {
	try {
    	const data = await sesClient.send(new CreateTemplateCommand(params));
    	console.log("Success", data);
  	} catch (err) {
    	console.log("Error", err.stack);
  	}
}

const app = fastify({ logger: true })

app.post('/notify', async (req, res) => { 
	let { signedIn, action, params } = req.body;
	switch (action) {
		case 'send-template-email':
			sendTemplateEmail(params);
      res.send('send template email');
			break;
		case 'send-email':
			sendEmail(params);
      res.send('send email');
			break;
		case 'create-template':
			createTemplate(params);
      res.send('create template');
			break;
    default:
      res.send("Something went wrong")  	
	}
	
    
})

const server = app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`))