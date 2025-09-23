## Deployment notes

- This scaffold runs commands inside the container. For Prisma (Node) operations, Node must be available in the container (or use a multi-stage image that includes Node). For Django/Alembic, the Python environment must include project dependencies (Django, alembic, etc.).
- It's safest to mount your project's workspace into the container (e.g., with Docker `-v /path/to/repo:/workspace`) and pass `project_path: /workspace` in requests.
- Add authentication before exposing this to production.
- Consider using separate containers for Node-based tasks (Prisma) to avoid bloating one image with both Python and Node runtimes.
