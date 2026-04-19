import { createOpsEvent, getOpsRuns } from "@/lib/ops-admin";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendSnapshot = async () => {
        const snapshot = await getOpsRuns();
        controller.enqueue(
          encoder.encode(
            createOpsEvent("run.updated", { run: snapshot.runs[0] }) +
              createOpsEvent("alert.created", { alerts: snapshot.alerts }) +
              createOpsEvent("worker.heartbeat", {
                heartbeats: snapshot.heartbeats,
                queueDepth: snapshot.kpis.queueDepth,
              })
          )
        );
      };

      await sendSnapshot();

      const interval = setInterval(() => {
        void sendSnapshot();
      }, 10000);

      controller.enqueue(encoder.encode(`retry: 10000\n\n`));

      return () => clearInterval(interval);
    },
    cancel() {
      return undefined;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
