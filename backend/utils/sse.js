/**
 * Keep an SSE response alive and report when the client goes away.
 *
 * Course outlines and deep lessons can take 30-60s before the first model
 * token arrives. With no bytes on the wire, intermediaries (Render's proxy,
 * Cloudflare, nginx) close the connection as idle and the client sees a
 * generic network error mid-generation. An SSE comment line (`: ping`) is
 * ignored by EventSource/fetch parsers but resets those idle timers.
 */
const HEARTBEAT_MS = 15000;

function watchSse(res, onClose, { intervalMs = HEARTBEAT_MS } = {}) {
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(": ping\n\n");
  }, intervalMs);
  heartbeat.unref?.();

  // 'close' fires both on client disconnect and after res.end().
  res.on("close", () => {
    clearInterval(heartbeat);
    onClose();
  });
}

module.exports = { watchSse, HEARTBEAT_MS };
