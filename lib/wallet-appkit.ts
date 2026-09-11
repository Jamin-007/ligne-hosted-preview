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
  close(): Promise<void>;
  disconnect(namespace?: WalletNamespace): Promise<void>;
  getAddress(namespace: WalletNamespace): string | undefined;
  getAccount(namespace: WalletNamespace): WalletAccountState | undefined;
  getProvider<T>(namespace: WalletNamespace): T | undefined;
  open(options: { namespace: WalletNamespace; view: "Connect" }): Promise<unknown>;
  ready(): Promise<void>;
  switchNetwork(
    network: unknown,
    options?: { throwOnFailure?: boolean },
  ): Promise<void>;
  subscribeAccount(
    callback: (state: WalletAccountState) => void,
    namespace: WalletNamespace,
  ): () => void;
  subscribeProviders(callback: (providers: Record<string, unknown>) => void): () => void;
};

export async function activateWalletNetwork(
  modal: WalletAppKit,
  namespace: WalletNamespace,
) {
  const { bitcoin, mainnet } = await import("@reown/appkit/networks");
  await modal.switchNetwork(namespace === "bip122" ? bitcoin : mainnet, {
    throwOnFailure: true,
  });
}

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

      const modal = createAppKit({
        adapters: [wagmiAdapter, new BitcoinAdapter({ projectId })],
        networks: [mainnet, bitcoin],
        defaultNetwork: mainnet,
        defaultAccountTypes: { eip155: "eoa", bip122: "payment" },
        basic: true,
        projectId,
        metadata: {
          name: "Ligne",
          description: "Transferts non dépositaires BTC et ETH sur Mainnet.",
          url: window.location.origin,
          icons: [],
        },
        features: { analytics: false, email: false, socials: [] },
      }) as unknown as WalletAppKit;

      // createAppKit rend la main avant la restauration des connecteurs.
      // Attendre ready() évite d'ouvrir une seconde session WalletConnect.
      return modal.ready().then(() => modal);
    }).catch((error) => {
      walletAppKitPromise = undefined;
      throw error;
    });
  }

  return walletAppKitPromise;
}
