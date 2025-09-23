import os
import io
import json
import uuid
import httpx
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse, PlainTextResponse
from bs4 import BeautifulSoup

# Try to import kglab; if not available, fall back to rdflib
try:
    import kglab
    KGLAB_AVAILABLE = True
except Exception:
    KGLAB_AVAILABLE = False
from rdflib import Graph, URIRef, Literal, Namespace

app = FastAPI(title='kglab GKG Ingestion Adapter')

DATA_DIR = os.environ.get('DATA_DIR', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Simple in-memory graph registry (named graphs)
GRAPHS = {}

def _get_graph(name='default'):
    if name in GRAPHS:
        return GRAPHS[name]
    if KGLAB_AVAILABLE:
        kg = kglab.KnowledgeGraph(name=name)
        GRAPHS[name] = kg
        return kg
    else:
        g = Graph()
        GRAPHS[name] = g
        return g

def _save_graph_to_disk(name='default'):
    g = GRAPHS.get(name)
    if g is None:
        return None
    path = os.path.join(DATA_DIR, f"{name}.ttl")
    # If kglab object, get underlying rdflib graph
    if KGLAB_AVAILABLE and hasattr(g, 'graph'):
        rdf = g.graph
    else:
        rdf = g
    rdf.serialize(destination=path, format='turtle')
    return path

async def _fetch_url_text(url: str):
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        ct = r.headers.get('content-type','')
        if 'html' in ct:
            soup = BeautifulSoup(r.text, 'html.parser')
            # naive extraction: join visible paragraph text
            paragraphs = [p.get_text(separator=' ', strip=True) for p in soup.find_all('p')]
            text = '\n\n'.join(paragraphs)
            return text
        else:
            return r.text

def _simple_text_to_triples(graph_obj, text, source_name=None):
    # Basic scaffold: create a source node and add sentence literals as triples
    # Replace this with entity/relation extraction for real KG building
    ns = Namespace('http://example.org/gkg/')
    source_uri = URIRef(ns[f'source/{source_name or str(uuid.uuid4())}'])
    if KGLAB_AVAILABLE and hasattr(graph_obj, 'graph'):
        g = graph_obj.graph
    else:
        g = graph_obj
    # split into sentences naively
    sentences = [s.strip() for s in text.split('\n') if s.strip()][:100]
    for i, s in enumerate(sentences):
        triple_subj = URIRef(f"{source_uri}/sent/{i}")
        g.add((triple_subj, ns['text'], Literal(s)))
        g.add((source_uri, ns['hasSentence'], triple_subj))
    # return number of triples added (approx)
    return len(sentences) * 2

@app.post('/mcp/ingest_url')
async def ingest_url(payload: dict):
    url = payload.get('url')
    if not url:
        raise HTTPException(status_code=400, detail='url is required')
    source_name = payload.get('source_name')
    graph_name = payload.get('graph', 'default')
    text = await _fetch_url_text(url)
    g = _get_graph(graph_name)
    added = _simple_text_to_triples(g, text, source_name=source_name)
    path = _save_graph_to_disk(graph_name)
    return JSONResponse({'graph': graph_name, 'triples_added': added, 'saved': path})

@app.post('/mcp/ingest_text')
async def ingest_text(payload: dict):
    text = payload.get('text')
    if not text:
        raise HTTPException(status_code=400, detail='text is required')
    source_name = payload.get('source_name')
    graph_name = payload.get('graph', 'default')
    g = _get_graph(graph_name)
    added = _simple_text_to_triples(g, text, source_name=source_name)
    path = _save_graph_to_disk(graph_name)
    return JSONResponse({'graph': graph_name, 'triples_added': added, 'saved': path})

@app.post('/mcp/query')
async def query(payload: dict):
    sparql = payload.get('sparql')
    graph_name = payload.get('graph', 'default')
    if not sparql:
        raise HTTPException(status_code=400, detail='sparql is required')
    g = GRAPHS.get(graph_name)
    if g is None:
        raise HTTPException(status_code=404, detail=f'graph {graph_name} not found')
    if KGLAB_AVAILABLE and hasattr(g, 'graph'):
        rdf = g.graph
    else:
        rdf = g
    try:
        res = rdf.query(sparql)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    # Convert results to simple JSON
    results = []
    for row in res:
        row_obj = {}
        for i, v in enumerate(row):
            row_obj[f'col{i}'] = str(v)
        results.append(row_obj)
    return JSONResponse({'graph': graph_name, 'results': results})

@app.get('/mcp/export_graph')
async def export_graph(graph: Optional[str] = 'default', format: Optional[str] = 'ttl'):
    g = GRAPHS.get(graph)
    if g is None:
        raise HTTPException(status_code=404, detail=f'graph {graph} not found')
    if KGLAB_AVAILABLE and hasattr(g, 'graph'):
        rdf = g.graph
    else:
        rdf = g
    buf = io.BytesIO()
    fmt = 'turtle' if format == 'ttl' else ('json-ld' if format == 'json-ld' else 'nt')
    rdf.serialize(destination=buf, format=fmt)
    buf.seek(0)
    media = 'text/turtle' if fmt == 'turtle' else ('application/ld+json' if fmt == 'json-ld' else 'application/n-triples')
    return StreamingResponse(buf, media_type=media, headers={"Content-Disposition": f"attachment; filename={graph}.{format}"})

@app.get('/mcp/stats')
async def stats(graph: Optional[str] = 'default'):
    g = GRAPHS.get(graph)
    if g is None:
        return JSONResponse({'graph': graph, 'triples': 0})
    if KGLAB_AVAILABLE and hasattr(g, 'graph'):
        rdf = g.graph
    else:
        rdf = g
    return JSONResponse({'graph': graph, 'triples': len(rdf)})
