// Node.js: Job envelope verifier (RS256) using jsonwebtoken
// Save your RSA public key in META_PUBLIC_KEY.pem
// Install: npm install jsonwebtoken
const fs = require('fs');
const jwt = require('jsonwebtoken');

const pubPath = process.env.PUBLIC_KEY_PATH || './META_PUBLIC_KEY.pem';
const publicKey = fs.readFileSync(pubPath, 'utf8');

function verifyJob(token) {
  try {
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    return payload;
  } catch (e) {
    throw e;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node verify_job.js token.jwt');
    process.exit(1);
  }
  try {
    const payload = verifyJob(args[0]);
    console.log(JSON.stringify(payload, null, 2));
  } catch (e) {
    console.error('Verification failed:', e.message);
    process.exit(2);
  }
}
