import os, json, time, subprocess, tempfile, shutil, uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import jwt
from jwt import InvalidTokenError

app = FastAPI(title='MetaMCP Fallback Oracle Worker')

META_PUBLIC_KEY = os.environ.get('META_PUBLIC_KEY')  # PEM public key to verify envelope
WORKER_ID = os.environ.get('WORKER_ID', f'oracle-worker-{uuid.uuid4().hex[:6]}')

def verify_envelope(token: str):
    if not META_PUBLIC_KEY:
        raise HTTPException(status_code=500, detail='META_PUBLIC_KEY not configured')
    try:
        payload = jwt.decode(token, META_PUBLIC_KEY, algorithms=['RS256'], options={'verify_aud': False})
        return payload
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f'Invalid token: {str(e)}')

def run_cmd(cmd, cwd=None, timeout=600):
    try:
        proc = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return {'rc': proc.returncode, 'stdout': proc.stdout, 'stderr': proc.stderr}
    except Exception as e:
        return {'rc': -1, 'stdout': '', 'stderr': str(e)}

@app.post('/exec_fallback')
async def exec_fallback(request: Request):
    body = await request.json()
    token = body.get('envelope_jwt')
    consent = body.get('consent', False)
    if not token:
        raise HTTPException(status_code=400, detail='envelope_jwt required')
    payload = verify_envelope(token)
    # require explicit consent flag in envelope or body
    if not consent and not payload.get('consent_given'):
        raise HTTPException(status_code=403, detail='Explicit consent required to run on fallback worker')
    task_id = payload.get('task_id', str(uuid.uuid4()))
    repo = payload.get('repo_url')
    ref = payload.get('ref', 'main')
    workdir = tempfile.mkdtemp(prefix='fallback-')
    result = {'task_id': task_id, 'worker': WORKER_ID}
    try:
        if repo:
            clone_cmd = f"git clone --depth 1 --branch {ref} {repo} {workdir}/repo"
            result['clone'] = run_cmd(clone_cmd)
            repo_dir = f"{workdir}/repo"
        else:
            repo_dir = workdir
        # simple run: create a tar.gz of repo as artifact (replace with heavy processing)
        tar_path = f"{workdir}/artifact_{task_id}.tar.gz"
        run_cmd(f"tar -czf {tar_path} -C {repo_dir} .")
        result['artifact'] = tar_path
        result['status'] = 'completed'
    except Exception as e:
        result['status'] = 'failed'
        result['error'] = str(e)
    finally:
        # cleanup is optional
        try:
            shutil.rmtree(workdir)
        except Exception:
            pass
    return JSONResponse(result)
