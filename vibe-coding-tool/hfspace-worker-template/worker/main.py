import os, io, json, time, tempfile, subprocess, shutil, uuid
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import JSONResponse
import httpx
import jwt
from jwt import InvalidTokenError
from huggingface_hub import HfApi
from pathlib import Path

# Optional imports (kglab, rdflib) - used if installed
try:
    import kglab
    KGLAB_AVAILABLE = True
except Exception:
    KGLAB_AVAILABLE = False
try:
    from rdflib import Graph, URIRef, Literal, Namespace
    RDF_AVAILABLE = True
except Exception:
    RDF_AVAILABLE = False

app = FastAPI(title='MetaMCP HF Space Worker Template')

HF_TOKEN = os.environ.get('HF_TOKEN')  # User-provided token in their HF Space secrets
META_PUBLIC_KEY = os.environ.get('META_PUBLIC_KEY')  # PEM public key used to verify envelopes
WORKER_ID = os.environ.get('WORKER_ID', f'worker-{uuid.uuid4().hex[:8]}')
DEFAULT_HF_REPO = os.environ.get('DEFAULT_HF_REPO')  # e.g., 'username/repo-datasets' or dataset id
API_TIMEOUT = int(os.environ.get('API_TIMEOUT', '20'))

@app.get('/mcp/health')
async def health():
    return JSONResponse({'status': 'ok', 'worker_id': WORKER_ID, 'uptime_s': int(time.time())})

@app.get('/mcp/capabilities')
async def capabilities():
    caps = {
        'kglab': KGLAB_AVAILABLE,
        'rdflib': RDF_AVAILABLE,
        'semgrep': shutil.which('semgrep') is not None,
        'git': shutil.which('git') is not None,
        'tree_sitter': True,  # best-effort - requires python tree_sitter installed
        'ram_gb_estimate': 16
    }
    return JSONResponse(caps)

def verify_envelope(envelope_jwt: str) -> Dict[str, Any]:
    """Verify RS256 JWT envelope using META_PUBLIC_KEY (PEM). Returns payload dict if valid."""
    if not META_PUBLIC_KEY:
        raise HTTPException(status_code=500, detail='META_PUBLIC_KEY not configured in worker')
    try:
        payload = jwt.decode(envelope_jwt, META_PUBLIC_KEY, algorithms=['RS256'], options={"verify_aud": False})
        return payload
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f'Invalid envelope JWT: {str(e)}')

def run_subprocess(cmd, cwd=None, timeout=600):
    try:
        proc = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return {'returncode': proc.returncode, 'stdout': proc.stdout, 'stderr': proc.stderr}
    except subprocess.TimeoutExpired as e:
        return {'returncode': -1, 'stdout': e.stdout or '', 'stderr': 'TIMEOUT'}
    except Exception as e:
        return {'returncode': -2, 'stdout': '', 'stderr': str(e)}

def simple_kglab_run(repo_dir: str, out_dir: str, source_name: Optional[str] = None):
    """Simple placeholder: build a tiny RDF by reading README files and saving TTL.
    Replace this with richer kglab ingestion logic as needed."""
    try:
        if KGLAB_AVAILABLE:
            kg = kglab.KnowledgeGraph(name=source_name or 'kg')
            # naive ingestion: read README or .md files and add as sentences
            texts = []
            for p in Path(repo_dir).rglob('*.md'):
                try:
                    texts.append(p.read_text(encoding='utf-8'))
                except Exception:
                    continue
            content = '\n\n'.join(texts)[:100000]
            if content:
                # add as a single node
                kg.add_text(content, source=source_name or 'repo')
            ttl_path = Path(out_dir) / 'kg.ttl'
            kg.graph.serialize(destination=str(ttl_path), format='turtle')
            return {'files': [str(ttl_path)], 'notes': 'kglab used' }
        else:
            # fallback: create a simple turtle with rdflib
            g = Graph()
            ns = Namespace('http://example.org/gkg/')
            subj = URIRef(ns['source/' + (source_name or 'repo')])
            for i, p in enumerate(Path(repo_dir).rglob('*.md')):
                try:
                    text = p.read_text(encoding='utf-8')[:2000]
                except Exception:
                    continue
                o = Literal(text)
                g.add((subj, ns['hasDocPart'], o))
            ttl_path = Path(out_dir) / 'kg.ttl'
            g.serialize(destination=str(ttl_path), format='turtle')
            return {'files': [str(ttl_path)], 'notes': 'rdflib fallback used'}
    except Exception as e:
        return {'error': str(e)}

def run_semgrep(repo_dir: str, out_dir: str):
    # Run semgrep and write json output
    out_file = Path(out_dir) / 'semgrep.json'
    cmd = f"semgrep --config auto --json --output {out_file} {repo_dir}"
    r = run_subprocess(cmd, cwd=repo_dir, timeout=1800)
    return {'files': [str(out_file)], 'semgrep': r}

def run_tree_sitter_stats(repo_dir: str, out_dir: str):
    # naive: count files per extension and sizes
    stats = {}
    for p in Path(repo_dir).rglob('*'):
        if p.is_file():
            ext = p.suffix.lower() or 'noext'
            stats.setdefault(ext, 0)
            stats[ext] += p.stat().st_size
    out_file = Path(out_dir) / 'file_stats.json'
    out_file.write_text(json.dumps(stats, indent=2))
    return {'files': [str(out_file)], 'stats': stats}

def upload_artifacts_to_hf(files: list, hf_repo: Optional[str], token: Optional[str]):
    """Upload files to HF repo_id. Returns map of filename->url (or repo pointers).
    Uses huggingface_hub.HfApi.upload_file with repo_type='dataset' if dataset style is desired.
    """
    api = HfApi()
    results = {}
    if not token:
        raise HTTPException(status_code=400, detail='HF_TOKEN is required to upload artifacts')
    for fpath in files:
        p = Path(fpath)
        if not p.exists():
            continue
        repo_id = hf_repo or DEFAULT_HF_REPO
        if not repo_id:
            raise HTTPException(status_code=400, detail='No HF repo/dataset configured to upload artifacts')
        # upload each file under a folder named by worker id and timestamp
        path_in_repo = f"artifacts/{WORKER_ID}/{p.name}"
        try:
            api.upload_file(
                path_or_fileobj=str(p),
                path_in_repo=path_in_repo,
                repo_id=repo_id,
                repo_type='dataset',
                token=token
            )
            # Construct a pointer URL (dataset file link)
            results[p.name] = f"hf://{repo_id}/{path_in_repo}"
        except Exception as e:
            results[p.name] = {'error': str(e)}
    return results

async def call_callback(callback_url: str, payload: dict, timeout: int = 20):
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            r = await client.post(callback_url, json=payload)
            return {'status_code': r.status_code, 'text': r.text}
        except Exception as e:
            return {'error': str(e)}

@app.post('/mcp/exec')
async def exec_job(request: Request):
    body = await request.json()
    envelope_jwt = body.get('envelope_jwt') or body.get('jwt')
    if not envelope_jwt:
        raise HTTPException(status_code=400, detail='envelope_jwt is required')
    payload = verify_envelope(envelope_jwt)
    # Basic schema: payload contains task_id, tool, repo_url, ref, callback_url, hf_repo (optional), params
    task_id = payload.get('task_id') or str(uuid.uuid4())
    tool = payload.get('tool')
    repo_url = payload.get('repo_url')
    ref = payload.get('ref', 'main')
    callback_url = payload.get('callback_url')
    hf_repo = payload.get('hf_repo') or DEFAULT_HF_REPO
    params = payload.get('params') or {}
    # Create workspace
    workdir = Path(tempfile.mkdtemp(prefix='mcp-work-'))
    outdir = workdir / 'out'
    outdir.mkdir(parents=True, exist_ok=True)
    result = {'task_id': task_id, 'worker_id': WORKER_ID, 'status': 'started'}
    try:
        # clone repo shallow
        if repo_url:
            clone_cmd = f"git clone --depth 1 --branch {ref} {repo_url} {workdir / 'repo'}"
            r_clone = run_subprocess(clone_cmd, cwd=str(workdir), timeout=600)
            result['clone'] = r_clone
            repo_dir = str(workdir / 'repo')
        else:
            repo_dir = str(workdir)
        # Depending on tool, run pipeline
        artifacts = []
        notes = {}
        if tool and 'kglab' in tool:
            kres = simple_kglab_run(repo_dir, str(outdir), source_name=params.get('source_name'))
            if 'files' in kres:
                artifacts.extend(kres['files'])
            notes['kglab'] = kres
        if tool and 'semgrep' in tool:
            sres = run_semgrep(repo_dir, str(outdir))
            artifacts.extend(sres.get('files', []))
            notes['semgrep'] = sres
        if tool and 'tree_sitter' in tool:
            tres = run_tree_sitter_stats(repo_dir, str(outdir))
            artifacts.extend(tres.get('files', []))
            notes['tree_sitter'] = tres
        # Always produce a zip of outdir for convenience
        zip_path = workdir / f"artifacts_{task_id}.zip"
        shutil.make_archive(str(zip_path).replace('.zip',''), 'zip', str(outdir))
        artifacts.append(str(zip_path))
        # Upload artifacts to HF
        upload_results = upload_artifacts_to_hf(artifacts, hf_repo, HF_TOKEN)
        result.update({'status': 'completed', 'artifacts': upload_results, 'notes': notes})
        # Callback
        if callback_url:
            callback_payload = {'task_id': task_id, 'status': 'completed', 'results': {'artifacts': upload_results}, 'meta_request_id': payload.get('meta_request_id')}
            cbres = await call_callback(callback_url, callback_payload, timeout=API_TIMEOUT)
            result['callback'] = cbres
    except Exception as e:
        result.update({'status': 'failed', 'error': str(e)})
        if callback_url:
            await call_callback(callback_url, {'task_id': task_id, 'status': 'failed', 'error': str(e), 'meta_request_id': payload.get('meta_request_id')}, timeout=API_TIMEOUT)
    finally:
        # optional: cleanup workspace
        try:
            shutil.rmtree(workdir)
        except Exception:
            pass
    return JSONResponse(result)
