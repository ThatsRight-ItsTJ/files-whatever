import os, subprocess, json, shlex, tempfile, pathlib, time
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

app = FastAPI(title='Seeding Orchestrator MCP')

def _run_command(cmd, cwd=None, env=None, timeout=300):
    # cmd can be list or string
    try:
        # if cmd is string, run through shell for convenience
        if isinstance(cmd, (list, tuple)):
            proc = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout)
        else:
            proc = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout, shell=True)
        return {'returncode': proc.returncode, 'stdout': proc.stdout, 'stderr': proc.stderr}
    except subprocess.TimeoutExpired as e:
        return {'returncode': -1, 'stdout': e.stdout or '', 'stderr': 'TIMEOUT'}
    except Exception as e:
        return {'returncode': -2, 'stdout': '', 'stderr': str(e)}

def detect_project_type(project_path: str):
    p = pathlib.Path(project_path)
    if (p / 'prisma' / 'schema.prisma').exists():
        return 'prisma'
    if (p / 'manage.py').exists():
        return 'django'
    if (p / 'alembic.ini').exists() or any((p.glob('**/alembic.ini'))):
        return 'alembic'
    return 'unknown'

@app.post('/mcp/seed')
async def seed(request: Request):
    payload = await request.json()
    project_path = payload.get('project_path') or '.'
    project_type = payload.get('project_type', 'auto')
    env_in = payload.get('env', {}) or {}
    fixtures = payload.get('fixtures', []) or []
    timeout = int(payload.get('timeout', 300))

    project_path = os.path.abspath(project_path)
    if not os.path.exists(project_path):
        raise HTTPException(status_code=400, detail=f'project_path does not exist: {project_path}')

    detected = detect_project_type(project_path)
    if project_type == 'auto' or not project_type:
        project_type = detected
    result = {'project_path': project_path, 'detected': detected, 'chosen': project_type, 'runners': {}}

    # base env: merge os.environ with provided env_in (do not overwrite critical vars unless provided)
    run_env = os.environ.copy()
    run_env.update({k: str(v) for k, v in (env_in or {}).items()})

    if project_type == 'prisma':
        # Ensure node + npx available - this is a scaffold; in many setups you'd run this in a node container
        cmd = 'npx prisma db seed'
        r = _run_command(cmd, cwd=project_path, env=run_env, timeout=timeout)
        result['runners']['prisma'] = r

    elif project_type == 'django':
        # run migrations first
        migrate_cmd = 'python manage.py migrate --noinput'
        r_mig = _run_command(migrate_cmd, cwd=project_path, env=run_env, timeout=timeout)
        result['runners']['migrate'] = r_mig
        # load fixtures if provided
        if fixtures:
            fixtures_results = []
            for fx in fixtures:
                loaddata_cmd = f'python manage.py loaddata {shlex.quote(fx)}'
                r_fx = _run_command(loaddata_cmd, cwd=project_path, env=run_env, timeout=timeout)
                fixtures_results.append({'fixture': fx, 'result': r_fx})
            result['runners']['fixtures'] = fixtures_results
        else:
            # if a management command `seed` exists, run it; otherwise inform user
            # naive check: look for a management command in app/management/commands/seed.py
            seed_cmd_path = pathlib.Path(project_path)
            found_seed_cmd = False
            for p in seed_cmd_path.rglob('management/commands/seed.py'):
                found_seed_cmd = True
                break
            if found_seed_cmd:
                r_seed = _run_command('python manage.py seed', cwd=project_path, env=run_env, timeout=timeout)
                result['runners']['seed_command'] = r_seed
            else:
                result['runners']['note'] = 'No fixtures provided and no manage.py seed command found. Provide fixtures or a seed management command.'

    elif project_type == 'alembic':
        # alembic upgrade head
        # run from project_path or where alembic.ini exists
        # find alembic.ini
        alembic_ini = None
        p = pathlib.Path(project_path)
        for candidate in p.rglob('alembic.ini'):
            alembic_ini = str(candidate)
            break
        if alembic_ini:
            # set ALEMBIC_CONFIG if needed
            # run alembic upgrade head
            cmd = f'alembic -c {shlex.quote(alembic_ini)} upgrade head'
            r = _run_command(cmd, cwd=project_path, env=run_env, timeout=timeout)
            result['runners']['alembic'] = r
        else:
            result['runners']['alembic'] = {'returncode': -3, 'stderr': 'alembic.ini not found'}
    else:
        result['runners']['error'] = f'Unknown project type: {project_type}. Detected: {detected}. Provide project_type explicitly.'

    return JSONResponse(result)
