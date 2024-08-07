const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables

// Initialize Express app
const app = express();

// Use body-parser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// Create service account credentials using environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters in private key
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Endpoint to handle sending notifications
app.post('/send-notification', async (req, res) => {
  const { token, amount } = req.body;

  if (!token || !amount) {
    return res.status(400).send('Missing token or amount');
  }

  const message = {
    notification: {
      title: 'Transfer Approval Required',
      body: `You have a transfer request of ${amount} for approval.`,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).send('Notification sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Failed to send notification');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
