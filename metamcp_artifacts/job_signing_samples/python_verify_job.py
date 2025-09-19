# Python: Job envelope verifier (RS256) for workers (uses public key)
# Save MetaMCP public key PEM to META_PUBLIC_KEY.pem
# Install: pip install pyjwt[crypto]
import jwt, json, sys
from jwt import InvalidTokenError

PUBLIC_KEY_PATH = 'META_PUBLIC_KEY.pem'

def load_public_key(path=PUBLIC_KEY_PATH):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def verify_job(token: str, public_key_pem: str):
    try:
        payload = jwt.decode(token, public_key_pem, algorithms=['RS256'], options={'verify_aud': False})
        return payload
    except InvalidTokenError as e:
        raise

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python verify_job.py token.jwt')
        sys.exit(1)
    token = sys.argv[1]
    pk = load_public_key()
    try:
        payload = verify_job(token, pk)
        print(json.dumps(payload, indent=2))
    except Exception as e:
        print('Verification failed:', str(e))
        sys.exit(2)
