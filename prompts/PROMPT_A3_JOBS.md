Implement the async background job system.

Deliverables:
- jobs table logic
- /worker/index.ts polling loop
- Job lifecycle: queued → running → completed | failed
- progress (0–100)
- logs persisted to DB

Requirements:
- Worker is restart-safe
- UI never waits for jobs
- Include one mock job that sleeps and updates progress

This must run locally in a second terminal.
Do not implement real validation yet.
