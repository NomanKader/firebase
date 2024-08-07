const admin = require('firebase-admin');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

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

// API Route with CORS enabled
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // End the preflight request
  }

  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse the request body
  const { token, amount } = req.body;

  // Validate the request body
  if (!token || !amount) {
    return res.status(400).json({ error: 'Missing token or amount' });
  }

  // Create the notification message
  const message = {
    notification: {
      title: 'Transfer Approval Required',
      body: `You have a transfer request of ${amount} for approval.`,
    },
    token: token,
  };

  try {
    // Send the notification using Firebase Admin SDK
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return res.status(200).json({ success: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
};
