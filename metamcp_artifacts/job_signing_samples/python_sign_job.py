# Python: Job envelope signer (RS256) using PyJWT
# Save your MetaMCP private key PEM to META_PRIVATE_KEY.pem and use this script to sign job payloads.
# Install: pip install pyjwt[crypto]
import json, sys, time
import jwt

PRIVATE_KEY_PATH = 'META_PRIVATE_KEY.pem'  # path to RSA private key in PEM format

def load_private_key(path=PRIVATE_KEY_PATH):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def sign_job(payload: dict, private_key_pem: str, exp_seconds=900):
    now = int(time.time())
    claims = payload.copy()
    claims['iat'] = now
    claims['exp'] = now + exp_seconds
    # optional: add issuer/audience
    claims['iss'] = 'metamcp.example.com'
    token = jwt.encode(claims, private_key_pem, algorithm='RS256')
    return token

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python sign_job.py payload.json')
        sys.exit(1)
    payload_path = sys.argv[1]
    with open(payload_path, 'r', encoding='utf-8') as f:
        payload = json.load(f)
    pk = load_private_key()
    token = sign_job(payload, pk, exp_seconds=900)
    print(token)
