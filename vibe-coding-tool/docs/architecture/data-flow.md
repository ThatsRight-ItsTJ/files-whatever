# End-to-End Data Flow

The Vibe Coding Tool's data flow follows a request-response pattern optimized for async processing and distributed execution. User inputs from the frontend trigger tasks in the backend orchestrator, which routes to MCPs based on capabilities. Results are handled efficiently with caching for small data and pointers for large outputs (e.g., KG exports). This ensures low latency for light tasks and scalability for heavy compute.

## Core Principles

- **Async Processing**: Tasks queue via Redis/RQ; results stream via SSE or poll.
- **Pointer-Based Results**: Heavy MCPs (e.g., Semgrep scans) store in HF Datasets, return lightweight pointers to avoid large payloads.
- **Consent and Fallbacks**: Preflight checks for user MCPs; fallbacks to oracle with UI consent.
- **Tracing**: All flows emit Prometheus metrics; spans for debugging.

From the technical specifications, the flow supports complete user journeys: onboarding → project creation → task execution → visualization.

## End-to-End Data Flow

1. **Input**: User interacts (e.g., "Generate todo component") in frontend chat/agent UI.
2. **Task Creation**: Frontend sends POST /api/tasks with task spec (type, input, capabilities).
3. **Routing**: Backend TaskRouter matches to MCP (e.g., code_gen → AI MCP in HF Space).
4. **Execution**: JobManager enqueues; worker dispatches to MCP URL with signed envelope (RS256).
5. **MCP Processing**: MCP executes (light: oracle; heavy: user Space), returns result or pointer.
6. **Result Handling**: ResultManager stores (Redis/DB or HF); notifies via callback/SSE.
7. **Output**: Frontend polls/receives stream, updates UI (editor diff, KG graph).

Error paths: Retries (3x), fallback, user notification.

## Sequence Diagram for User Task Flow

Adapted from Technical_Specifications.md and development plans:

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Next.js)
    participant B as Backend (FastAPI)
    participant R as Task Router
    participant M as MCP (e.g., HF Space)
    participant S as Services (GitHub/HF)
    participant D as DB/Redis

    U->>F: Input task (e.g., "Add todo list")
    F->>B: POST /api/tasks {task: {type: "code_gen", input: prompt}}
    B->>R: route_task(task)
    R->>D: Query registry & health
    D-->>R: MCP list (e.g., AI MCP)
    R-->>B: Target = {url: "hf://user-ai-space", type: "heavy"}
    B->>B: create_job(task)
    Note over B: Enqueue to RQ
    B->>M: POST /execute {signed_job: {id, input, callback}}
    M->>S: Integrate (e.g., GitHub fetch context)
    S-->>M: Data (e.g., repo files)
    M->>M: Process (generate code)
    alt Heavy Result
        M->>S: Upload to HF Dataset
        S-->>M: Pointer URL
        M-->>B: {type: "pointer", location: "hf://dataset/path"}
    else Light Result
        M-->>B: {data: generated_code}
    end
    B->>D: store_result(result)
    D-->>B: result_id
    B->>F: SSE/202 Accepted {task_id, status: "running"}
    loop Poll/Stream
        F->>B: GET /api/tasks/{id}
        B->>D: get_result(id)
        D-->>B: Resolved result (fetch pointer if needed)
        B-->>F: {status: "completed", result}
    end
    F->>U: Update UI (diff, KG)
```

This diagram shows a code generation flow: From user prompt to MCP execution, with pointer handling for large outputs. For KG building, S would be kglab MCP ingesting files.

## Result Resolution

For pointers:
- Backend resolves on GET /results/{id}: Fetches from HF if pointer.
- Frontend handles via React Query caching to avoid refetches.

## Monitoring Data Flow

- Metrics: Task latency, MCP success rate, queue depth (Prometheus).
- Logs: Structured events (e.g., "task_routed: mcp=semgrep, duration=2s").
- Traces: OpenTelemetry spans for end-to-end visibility.

For MCP-specific flows: See [MCP Servers](../mcps/development.md). Implementation: [Backend Job Management](backend.md#job-management).

Back to [Overview](overview.md).