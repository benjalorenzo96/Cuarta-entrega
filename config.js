import dotenv from 'dotenv';
dotenv.config();


const config = {
  databaseConnectionString: process.env.DB_CONNECTION_STRING,
  secretKey: process.env.SECRET_KEY,
  githubClientID: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER: process.env.TWILIO_NUMBER,
};

export default config;

  