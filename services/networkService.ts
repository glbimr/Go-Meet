import { ConnectionStage, NetworkStats } from '../types';

// Deterministic hash to get a consistent subnet for a meeting ID
const getMeetingSubnet = (meetingId: string): number => {
  let hash = 0;
  for (let i = 0; i < meetingId.length; i++) {
    hash = meetingId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 254) + 1; // 1-254
};

export const simulateHandshake = (
  meetingId: string,
  onStageChange: (stage: ConnectionStage) => void
): Promise<string> => {
  return new Promise((resolve) => {
    let currentStage = 0;
    const stages = [
      ConnectionStage.DETECTING_NETWORK,
      ConnectionStage.HANDSHAKE_PROXY,
      ConnectionStage.ALLOCATING_IP,
      ConnectionStage.ESTABLISHING_TUNNEL,
      ConnectionStage.CONNECTED
    ];

    const runStage = () => {
      if (currentStage >= stages.length) {
        // Generate a deterministic IP for this meeting's subnet
        // We add a random component for the host/client differentiation 
        // but keep the subnet fixed to simulate a single proxy network.
        const subnet = getMeetingSubnet(meetingId);
        const hostPart = Math.floor(Math.random() * 253) + 2; // 2-255
        resolve(`10.${subnet}.0.${hostPart}`);
        return;
      }

      if (onStageChange) {
        onStageChange(stages[currentStage]);
      }
      currentStage++;
      
      // Slightly faster handshake for better UX
      const delay = Math.floor(Math.random() * 500) + 600;
      setTimeout(runStage, delay);
    };

    runStage();
  });
};

export const generateMockNetworkStats = (isProxyEnabled: boolean): NetworkStats => {
  if (isProxyEnabled) {
    // Stable, consistent stats simulating the proxy tunnel
    return {
      latency: 35 + Math.random() * 10, // Improved latency stats
      jitter: 1 + Math.random() * 2,
      packetLoss: 0,
      throughput: 8.5,
      protocol: 'TCP/Proxy'
    };
  } else {
    // Volatile stats simulating public internet
    return {
      latency: 80 + Math.random() * 100,
      jitter: 15 + Math.random() * 20,
      packetLoss: 1.5 + Math.random() * 2,
      throughput: 2.1,
      protocol: 'UDP'
    };
  }
};