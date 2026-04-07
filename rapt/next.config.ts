import os from "node:os";
import type { NextConfig } from "next";

function getAllowedDevOrigins() {
  const origins = new Set(["127.0.0.1", "::1"]);

  for (const network of Object.values(os.networkInterfaces())) {
    for (const address of network ?? []) {
      if (address.internal) continue;
      origins.add(address.address);
    }
  }

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  // Next 16 blocks internal dev routing assets when the app is opened from
  // 127.0.0.1 or an IDE/LAN preview host unless we allow those origins.
  allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
