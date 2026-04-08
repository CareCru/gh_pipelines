import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { appendFileSync } from 'fs';

const { AWS_DEFAULT_REGION, SECRET_NAME, OUTPUT_PATH } = process.env;

const client = new SecretsManagerClient({ region: AWS_DEFAULT_REGION });
const { SecretString } = await client.send(
  new GetSecretValueCommand({ SecretId: SECRET_NAME })
);

const lines = Object.entries(JSON.parse(SecretString))
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');

appendFileSync(OUTPUT_PATH, lines);
console.log(`✅ Written to ${OUTPUT_PATH}`);
