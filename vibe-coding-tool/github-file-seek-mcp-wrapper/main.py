import os, io, re, fnmatch, asyncio, base64
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
import httpx

app = FastAPI(title="GitHub File-Seek MCP Wrapper")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or ""
API_BASE = "https://api.github.com"

async def _get_branch_sha(client: httpx.AsyncClient, owner: str, repo: str, branch: str):
    url = f"{API_BASE}/repos/{owner}/{repo}/branches/{branch}"
    r = await client.get(url, headers={"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {})
    if r.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Branch {branch} not found for {owner}/{repo}")
    r.raise_for_status()
    data = r.json()
    # commit sha
    return data.get("commit", {}).get("commit", {}).get("tree", {}).get("sha") or data.get("commit", {}).get("sha") or data.get("commit", {}).get("commit", {}).get("sha") or data.get("commit", {}).get("sha") or data.get("commit", {}).get("commit", {}).get("tree", {}).get("sha")

async def _get_recursive_tree(client: httpx.AsyncClient, owner: str, repo: str, sha_or_branch: str):
    # Try using tree with recursive flag. GitHub accepts a sha or a branch name in many cases.
    url = f"{API_BASE}/repos/{owner}/{repo}/git/trees/{sha_or_branch}?recursive=1"
    r = await client.get(url, headers={"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {})
    if r.status_code == 404:
        # Fallback: try to get branch info and use its commit sha
        branch_info = await client.get(f"{API_BASE}/repos/{owner}/{repo}/branches/{sha_or_branch}", headers={"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {})
        branch_info.raise_for_status()
        bdata = branch_info.json()
        sha = bdata.get("commit", {}).get("sha")
        r = await client.get(f"{API_BASE}/repos/{owner}/{repo}/git/trees/{sha}?recursive=1", headers={"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {})
    r.raise_for_status()
    return r.json()

def _filter_paths(tree: dict, pattern: str, mode: str = "glob") -> List[str]:
    paths = [item["path"] for item in tree.get("tree", []) if item.get("type") == "blob"]
    matched = []
    if mode == "glob":
        # support ** patterns
        for p in paths:
            if fnmatch.fnmatch(p, pattern):
                matched.append(p)
    else:
        regex = re.compile(pattern)
        for p in paths:
            if regex.search(p):
                matched.append(p)
    return matched

async def _fetch_file_content_raw(client: httpx.AsyncClient, owner: str, repo: str, path: str, ref: Optional[str] = None) -> bytes:
    # Use raw.githubusercontent for speed; include auth header for private repos
    ref_part = ref or "main"
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{ref_part}/{path}"
    r = await client.get(raw_url, headers={"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {})
    r.raise_for_status()
    return r.content

@app.post('/mcp/find_files')
async def find_files(payload: dict):
    """Payload: { repo: 'owner/repo', branch?: 'main', pattern: '**/*.py', mode?: 'glob'|'regex' }"""
    repo = payload.get("repo")
    if not repo:
        raise HTTPException(status_code=400, detail="repo is required (owner/repo)")
    try:
        owner, repo_name = repo.split("/")
    except Exception:
        raise HTTPException(status_code=400, detail="repo must be in owner/repo format")
    branch = payload.get("branch", "main")
    pattern = payload.get("pattern", "**/*")
    mode = payload.get("mode", "glob")
    async with httpx.AsyncClient(timeout=30.0) as client:
        tree = await _get_recursive_tree(client, owner, repo_name, branch)
        matched = _filter_paths(tree, pattern, mode)
    return JSONResponse({"repo": f"{owner}/{repo_name}", "branch": branch, "pattern": pattern, "mode": mode, "matches": matched})

@app.post('/mcp/download_files')
async def download_files(payload: dict):
    """Payload: { repo: 'owner/repo', branch?: 'main', paths: ['a.py','b.txt'] }"""
    repo = payload.get("repo")
    if not repo:
        raise HTTPException(status_code=400, detail="repo is required (owner/repo)")
    try:
        owner, repo_name = repo.split("/")
    except Exception:
        raise HTTPException(status_code=400, detail="repo must be in owner/repo format")
    branch = payload.get("branch", "main")
    paths = payload.get("paths") or []
    if not paths:
        raise HTTPException(status_code=400, detail="paths is required (list of file paths)")
    async with httpx.AsyncClient(timeout=30.0) as client:
        # fetch files concurrently
        tasks = [ _fetch_file_content_raw(client, owner, repo_name, p, branch) for p in paths ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    # build zip
    buf = io.BytesIO()
    import zipfile
    z = zipfile.ZipFile(buf, mode='w', compression=zipfile.ZIP_DEFLATED)
    for p, content in zip(paths, results):
        if isinstance(content, Exception):
            # include an error.txt describing the failure
            z.writestr(f"ERROR_{p}.txt", str(content))
        else:
            z.writestr(p, content)
    z.close()
    buf.seek(0)
    return StreamingResponse(buf, media_type='application/zip', headers={"Content-Disposition": f"attachment; filename=files_{owner}_{repo_name}.zip"})
