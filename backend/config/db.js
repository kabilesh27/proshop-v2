import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

const connectDB = async () => {
  console.log(AWS.config.region);
  try {
    const dynamodb = new AWS.DynamoDB();
    const tables = await dynamodb.listTables().promise();
    console.log(`Connected to DynamoDB. Tables: ${tables.TableNames.join(', ')}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
const docClient = new AWS.DynamoDB.DocumentClient();

export { docClient, connectDB };
