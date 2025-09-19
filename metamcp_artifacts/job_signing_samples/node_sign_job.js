// Node.js: Job envelope signer (RS256) using jsonwebtoken
// Save your RSA private key in META_PRIVATE_KEY.pem
// Install: npm install jsonwebtoken
const fs = require('fs');
const jwt = require('jsonwebtoken');

const pkPath = process.env.PRIVATE_KEY_PATH || './META_PRIVATE_KEY.pem';
const privateKey = fs.readFileSync(pkPath, 'utf8');

function signJob(payload, expiresIn='15m') {
  const claims = Object.assign({}, payload, { iss: 'metamcp.example.com' });
  const token = jwt.sign(claims, privateKey, { algorithm: 'RS256', expiresIn });
  return token;
}

// CLI usage: node sign_job.js payload.json
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node sign_job.js payload.json');
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  console.log(signJob(payload, '15m'));
}
