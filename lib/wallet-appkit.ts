export type WalletNamespace = "eip155" | "bip122";

export type WalletProvider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

export type WalletAccountState = {
  address?: string;
  allAccounts?: Array<{
    address: string;
    namespace?: string;
    type?: "payment" | "ordinal" | "stx" | "eoa" | "smartAccount";
  }>;
  isConnected: boolean;
  status?: "connecting" | "connected" | "disconnected" | "reconnecting";
};

export type WalletAppKit = {
  disconnect(namespace?: WalletNamespace): Promise<void>;
  getAddress(namespace: WalletNamespace): string | undefined;
  getAccount(namespace: WalletNamespace): WalletAccountState | undefined;
  getProvider<T>(namespace: WalletNamespace): T | undefined;
  open(options: { namespace: WalletNamespace; view: "Connect" }): Promise<unknown>;
  subscribeAccount(
    callback: (state: WalletAccountState) => void,
    namespace: WalletNamespace,
  ): () => void;
  subscribeProviders(callback: (providers: Record<string, unknown>) => void): () => void;
};

let walletAppKitPromise: Promise<WalletAppKit> | undefined;

export async function getWalletAppKit(projectId: string) {
  if (!walletAppKitPromise) {
    walletAppKitPromise = Promise.all([
      import("@reown/appkit"),
      import("@reown/appkit-adapter-bitcoin"),
      import("@reown/appkit-adapter-wagmi"),
      import("@reown/appkit/networks"),
    ]).then(([{ createAppKit }, { BitcoinAdapter }, { WagmiAdapter }, { bitcoin, mainnet }]) => {
      const evmNetworks = [mainnet];
      const wagmiAdapter = new WagmiAdapter({
        networks: evmNetworks,
        projectId,
        ssr: true,
      });

      return createAppKit({
        adapters: [wagmiAdapter, new BitcoinAdapter({ projectId })],
        networks: [mainnet, bitcoin],
        defaultNetwork: mainnet,
        defaultAccountTypes: { eip155: "eoa", bip122: "payment" },
        projectId,
        metadata: {
          name: "Ligne",
          description: "Transferts non dépositaires BTC et ETH sur Mainnet.",
          url: window.location.origin,
          icons: [],
        },
        features: { analytics: false, email: false, socials: [] },
      }) as unknown as WalletAppKit;
    }).catch((error) => {
      walletAppKitPromise = undefined;
      throw error;
    });
  }

  return walletAppKitPromise;
}
