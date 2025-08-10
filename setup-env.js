const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate random secret for JWT and NextAuth
const generateSecret = () => crypto.randomBytes(32).toString('hex');

const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.mongodb.net/myphim?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=${generateSecret()}

# NextAuth Configuration
NEXTAUTH_SECRET=${generateSecret()}
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
# Get these from Google Cloud Console: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
`;

const envFilePath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envFilePath, envContent);
  console.log('\x1b[32m%s\x1b[0m', '✅ .env.local file created successfully!');
  console.log('\x1b[33m%s\x1b[0m', 'Make sure to update your Google OAuth credentials.');
  console.log('\x1b[33m%s\x1b[0m', 'Make sure to use a valid MongoDB Atlas connection string.');
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error creating .env.local file:', error.message);
} 