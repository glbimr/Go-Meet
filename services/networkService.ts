import { ConnectionStage, NetworkStats } from '../types';

export const simulateHandshake = (
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
        // Return a simulated Virtual IP
        resolve(`10.8.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
        return;
      }

      onStageChange(stages[currentStage]);
      currentStage++;
      
      // Random delay between 800ms and 1500ms for realism
      const delay = Math.floor(Math.random() * 700) + 800;
      setTimeout(runStage, delay);
    };

    runStage();
  });
};

export const generateMockNetworkStats = (isProxyEnabled: boolean): NetworkStats => {
  if (isProxyEnabled) {
    // Stable, consistent stats simulating the proxy tunnel
    return {
      latency: 45 + Math.random() * 5,
      jitter: 2 + Math.random() * 3,
      packetLoss: 0.01,
      throughput: 4.5,
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