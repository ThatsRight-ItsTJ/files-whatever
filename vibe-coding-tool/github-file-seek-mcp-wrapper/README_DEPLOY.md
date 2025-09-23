## Deployment notes

- Set `GITHUB_TOKEN` in environment variables for private repo access.
- To deploy to Vercel: create a Vercel project pointing to this repo, set the environment variable `GITHUB_TOKEN` in Vercel dashboard, and set the Build Command to `pip install -r requirements.txt` and the Start Command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- To deploy to Docker: `docker build -t github-file-seek-mcp .` then `docker run -e GITHUB_TOKEN=ghp_xxx -p 8080:8080 github-file-seek-mcp`.
