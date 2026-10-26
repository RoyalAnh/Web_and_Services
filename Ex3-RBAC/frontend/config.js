if (!window.RBAC_API_BASE) {
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  window.RBAC_API_BASE = localHosts.has(window.location.hostname)
    ? "http://localhost:3001/api/v1"
    : "";
}
