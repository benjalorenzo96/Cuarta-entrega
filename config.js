import dotenv from 'dotenv';
dotenv.config();


const config = {
  databaseConnectionString: process.env.DB_CONNECTION_STRING,
  secretKey: process.env.SECRET_KEY,
  githubClientID: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
};

export default config;

  