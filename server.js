const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: 'pastquestionapp-b9c52',
  private_key_id: 'ba082c24045d69979571244c3d1f9b92867dc66f',
  private_key: `-----BEGIN PRIVATE KEY-----
  MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCpd6QVjPqZtn55\nuKm27d2B0UNA1ExSEJVG6BrDkJUgjIjNPYPpEyLSca35AZxGdrZT7hHXn7PMKpA5\nsBPlZw8baK/gqwdrJ3PkBpVi/LAQzaSAvDc/QNdsejcT219BOWfXFws7K6NUsxn1\no53mOoQIDzNnqCeVaZ0jpzuvAXH1P+AUTJoFihdhXuX/4XAfOFn/FWt03l7fi5KK\nsVqSRlmlUNdKPzoxNyElVcX+WlTIai8eJ5ibX1JiiAtusB0W/Ek0aCkxugzSMKR9\nZfEtvB6f/CMGW8peSjnjpMkkTXSYd0nbqLT3kVyXLj/tYXCgdaO6pdPMCTKalbqV\ndAwPwqr1AgMBAAECggEABDncQozrW09YB3k86WrOHGSKoxohzkwYK0mZEHZrDM6k\nXLKwUIaH8EW7qAF++amp/oOdBOQ4WIEmBPvbyyhoq1Wb4sp92vfqMm4D/93VFpFi\nQEzK3edw8WuszIoROompcFoxQmgvE9FX9ntLJTu67ige4owopiR/mC0diZqYhZw0\n2mDjjLBAtB+8R85kOi9BVE9juugUoEXog2jNz8pZDLBBrjVE/lwH3FTh2BBqzwGk\nmh/ow+5FGemqsRY40IKiTCBKTnIN7ZatqIE6L3E6ZUmi/olbHEX9M1AjZHLj2Hr9\ng+bKm7fcdqQM7p/R8LkBjlTPp0pWalxbb4d9bksfYQKBgQDf/TJqkV+cRwM0Lc8f\naKm5iBNyCATjW7k5vOdXz7h8AbhOaxMHCkYhG1LPS7OwMAA1r4StqLgUHWERZJrG\ny/j1ZOb6u21IbwGtamctHy/M1orH9hbB2rrYaQsSM/fox3Omui6DcCVqaZ92/hPS\nO87/VVQBCC2iG6kqATDke0cSkQKBgQDBr7pI5V7pAbJVJQiVI1kFkSn5cQO5RTzh\nmLdR8YGQKIFvUDadwhNpRvBHtLGApG+ctIc9ngOcKf7cKMx3jwj3HbfII1EsRAK8\n3mGjyxiSHgY/K3hzkvlGXSVMJG+gv5sMTS3sRquvvutZUM3+DDgidJTqWuiwq5pI\nAlChz3M8JQKBgQDfoxPlZwRJKnW+cUZtm7hqL70Ki4sl3fzP8xYgjJsr5SO52BqF\nWvKuN3O02WatMR/kejxEj0JLgxHZpdMLTbhier5L9TqlqX/JP4WIfaziHgsunzwV\njWgkjqypHg4V8p48B4RNY3lYB+FZk1EDBQgl03IuHZZCVs/NyqagWZ2aoQKBgB5S\neIN5BUbNMTILPjC6+/DXLQ8UFlUm9cULt4dom7QJ41md4S8JdyiAJpXTQAa3t5F8\n4b9PwZjtKi0lZf1Bs1GcoWz/unGHpDYVSovt+8bEVI4HLDBLziKp6nDlM2SjGo7u\ndkYLOk2lQgsVj2o6V39taPLXkJ43/0tOsXjjlVLRAoGBAIgqubSp9ai7TrpjjsKT\nlQ6NNyW4Aj1cmwl7keBvEaOs4mHNqunRP+QeMxKQxM11hQZT+yinvxS6+OcRC0K7\nGGcjn5FJD+JIBv/O/lvzSu6FLZ1ciALkX9mTwADalePAYw9qIZ2/r6Bbzux7rblj\n5dXy7rMkNJMKdv4Y+gVGBb2K
  -----END PRIVATE KEY-----
  `,
  client_email: 'firebase-adminsdk-fbsvc@pastquestionapp-b9c52.iam.gserviceaccount.com',
  client_id: '109147741665598672308',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pastquestionapp-b9c52.iam.gserviceaccount.com',
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pastquestionapp-b9c52.appspot.com',
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { course, year } = req.body;

    if (!file || !course || !year) {
      return res.status(400).send('Missing required fields');
    }

    // Reference the file in Firebase Storage
    const fileRef = bucket.file(`past-questions/${course}-${year}.pdf`);

    // Upload file
    await fileRef.save(file.buffer, {
      metadata: { contentType: "application/pdf" },
    });

    // Generate public URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/past-questions/${course}-${year}.pdf`;

    res.status(200).json({ message: "File uploaded successfully!", downloadURL });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
