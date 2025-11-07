import { getCachedListResource, getCachedResource } from "frappe-ui";
import { io } from "socket.io-client";
import { socketio_port } from "../../../../sites/common_site_config.json";

// extend window object
declare global {
  interface Window {
    site_name: string;
  }
}

export function initSocket() {
  const host = window.location.hostname;
  const siteName = window.site_name || host;

  // Always talk to socket.io over HTTP on the configured port
  const url = `http://${host}:${socketio_port}/${siteName}`;

  const socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  });

  socket.on("refetch_resource", (data) => {
    if (data.cache_key) {
      const resource =
        getCachedResource(data.cache_key) ||
        getCachedListResource(data.cache_key);
      if (resource) {
        resource.reload();
      }
    }
  });

  return socket;
}

export const socket = initSocket();

