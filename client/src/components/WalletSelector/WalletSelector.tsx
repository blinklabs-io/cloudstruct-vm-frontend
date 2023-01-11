import { WalletInfo, WalletState } from "src/entities/common.entities";
import Connect from "./Connect";
import Connected from "./Connected";
import WrongNetwork from "./WrongNetwork";

interface Props {
  disconnectWallet: () => void;
  showWalletSelection: () => void;
  walletState: WalletState;
  walletInfo: WalletInfo;
  isMobile: boolean;
}

function WalletSelector({
  disconnectWallet,
  showWalletSelection,
  walletState,
  walletInfo,
  isMobile,
}: Props) {
  switch (walletState) {
    case WalletState.connecting:
    case WalletState.connected:
      return (
        <Connected
          address={walletInfo.address}
          connecting={walletState === WalletState.connecting}
          iconUrl={walletInfo.iconUrl}
          prefix={walletInfo.prefix ?? ""}
          isMobile={isMobile}
          disconnectWallet={disconnectWallet}
        ></Connected>
      );
    case WalletState.wrongNetwork:
      return <WrongNetwork disconnectWallet={disconnectWallet} isMobile={isMobile}></WrongNetwork>;
    case WalletState.notConnected:
    default:
      return <Connect onClick={showWalletSelection} isMobile={isMobile}></Connect>;
  }
}

export default WalletSelector;
