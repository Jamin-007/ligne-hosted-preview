export type WalletProvider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

export type WalletAccountState = {
  address?: string;
  allAccounts?: Array<{
    address: string;
    namespace?: string;
    type?: "eoa" | "smartAccount";
  }>;
  isConnected: boolean;
  status?: "connecting" | "connected" | "disconnected" | "reconnecting";
};

export type WalletAppKit = {
  close(): Promise<void>;
  disconnect(namespace?: "eip155"): Promise<void>;
  getAddress(namespace: "eip155"): string | undefined;
  getAccount(namespace: "eip155"): WalletAccountState | undefined;
  getProvider<T>(namespace: "eip155"): T | undefined;
  open(options: {
    namespace: "eip155";
    view: "Connect" | "ConnectingWalletConnect";
  }): Promise<unknown>;
  ready(): Promise<void>;
  switchNetwork(network: unknown, options?: { throwOnFailure?: boolean }): Promise<void>;
  subscribeAccount(
    callback: (state: WalletAccountState) => void,
    namespace: "eip155",
  ): () => void;
  subscribeProviders(callback: (providers: Record<string, unknown>) => void): () => void;
};

export async function activateEthereumMainnet(modal: WalletAppKit) {
  const { mainnet } = await import("@reown/appkit/networks");
  await modal.switchNetwork(mainnet, { throwOnFailure: true });
}

let walletAppKitPromise: Promise<WalletAppKit> | undefined;

export async function getWalletAppKit(projectId: string) {
  if (!walletAppKitPromise) {
    walletAppKitPromise = Promise.all([
      import("@reown/appkit"),
      import("@reown/appkit-adapter-wagmi"),
      import("@reown/appkit/networks"),
    ]).then(([{ createAppKit }, { WagmiAdapter }, { mainnet }]) => {
      const networks = [mainnet];
      const wagmiAdapter = new WagmiAdapter({
        networks,
        projectId,
        ssr: true,
      });

      const modal = createAppKit({
        adapters: [wagmiAdapter],
        networks: [mainnet],
        defaultNetwork: mainnet,
        defaultAccountTypes: { eip155: "eoa" },
        projectId,
        metadata: {
          name: "Ligne",
          description: "Transferts non dépositaires ETH et USDC sur Ethereum Mainnet.",
          url: window.location.origin,
          icons: [],
        },
        features: { analytics: false, email: false, socials: [] },
      }) as unknown as WalletAppKit;

      return modal.ready().then(() => modal);
    }).catch((error) => {
      walletAppKitPromise = undefined;
      throw error;
    });
  }

  return walletAppKitPromise;
}
