/**
 * Helper to determine loading duration based on connection speed.
 * Does not display connection information anywhere on the UI.
 */
let cachedDuration = null;
let lastCheckTime = 0;

export const getNetworkLoadingDuration = () => {
  const now = Date.now();
  // Cache the estimate for 10 seconds to avoid unnecessary recalculations
  if (cachedDuration && now - lastCheckTime < 10000) {
    return cachedDuration;
  }

  try {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType; // 'slow-2g', '2g', '3g', '4g'
      const downlink = connection.downlink; // Mb/s
      const rtt = connection.rtt; // round trip time in ms

      // Weak / slow connection: take more time to load (4.5s)
      if (
        effectiveType === 'slow-2g' ||
        effectiveType === '2g' ||
        (downlink && downlink < 1.5) ||
        (rtt && rtt > 450)
      ) {
        cachedDuration = 4500;
      }
      // Moderate / 3G connection (3.2s)
      else if (
        effectiveType === '3g' ||
        (downlink && downlink < 3.5) ||
        (rtt && rtt > 220)
      ) {
        cachedDuration = 3200;
      }
      // Fast connection (4G / broadband): 2 to 3 seconds (2.3s)
      else {
        cachedDuration = 2300;
      }
    } else {
      // Modern standard fallback: 2 to 3 seconds
      cachedDuration = 2300;
    }
  } catch {
    cachedDuration = 2300;
  }

  lastCheckTime = now;
  return cachedDuration;
};
