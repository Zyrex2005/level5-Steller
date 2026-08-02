export interface RpcResponse<T = any> {
  result?: T;
  error?: string;
  actionableMessage?: string;
  cached?: boolean;
}

export async function callSorobanRpcWithRetry<T = any>(
  rpcUrl: string,
  body: any,
  retries = 3
): Promise<RpcResponse<T>> {
  try {
    const response = await fetch('/api/rpc-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcUrl, body })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      let actionableMessage = 'Transaction failed on Stellar Testnet. Please try again.';
      if (response.status === 429 || data.error?.includes('Rate')) {
        actionableMessage = 'Stellar RPC is currently experiencing high load. We have automatically retried with exponential backoff. Please wait a moment before trying again.';
      } else if (data.details?.includes('auth')) {
        actionableMessage = 'Wallet signature authorization failed. Please check Freighter wallet approval and try again.';
      } else if (data.details?.includes('balance')) {
        actionableMessage = 'Insufficient Testnet XLM balance. Fund your wallet using the Stellar Laboratory Friendbot.';
      }

      return {
        error: data.error || 'RPC_ERROR',
        actionableMessage
      };
    }

    return {
      result: data.result || data,
      cached: data.cached
    };
  } catch (err: any) {
    return {
      error: 'NETWORK_ERROR',
      actionableMessage: 'Unable to reach Stellar Testnet RPC. Please check your internet connection or switch to Demo Mode.'
    };
  }
}
