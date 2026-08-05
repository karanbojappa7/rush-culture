const { generateKeyPairSync } = require('crypto');
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const priv = Buffer.from(
  privateKey.export({ type: 'pkcs8', format: 'pem' }),
).toString('base64');
const pub = Buffer.from(
  publicKey.export({ type: 'spki', format: 'pem' }),
).toString('base64');
console.log('ENABLE_ENCRYPTION=true');
console.log(`ENCRYPTION_PRIVATE_KEY_B64=${priv}`);
console.log(`ENCRYPTION_PUBLIC_KEY_B64=${pub}`);
