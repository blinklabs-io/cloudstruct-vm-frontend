import { useSelector } from "react-redux";
import useComponentVisible from "src/hooks/useComponentVisible";
import { RootState } from "src/store";
import { abbreviateAddress } from "src/utils";
import Spinner from "../Spinner";
import Disconnect from "./Disconnect";

export default function Connected({
  connecting,
  iconUrl,
  prefix,
  isMobile,
  disconnectWallet,
}: {
  connecting: boolean;
  iconUrl?: string;
  prefix?: string;
  isMobile: boolean;
  disconnectWallet: () => void;
}) {
  const { wallet: connectedWallet, walletAddress: connectedWalletAddress } =
    useSelector((state: RootState) => state.wallet);

  const disconnectButtonMenu = useComponentVisible(false);

  const toggleDisconnectButton = () => {
    disconnectButtonMenu.setVisible(!disconnectButtonMenu.visible);
  };

  return (
    <div className="relative w-fit">
      <div
        className={`${
          isMobile ? "w-14 h-11" : "px-5"
        } shadow-lg rounded-lg background flex items-center justify-center py-2.5 cursor-pointer flex items-center gap-2`}
        onClick={toggleDisconnectButton}
      >
        {connecting ? (
          <div className="flex flex-row items-center gap-2">
            <Spinner></Spinner>
            {isMobile ? null : "Connecting"}
          </div>
        ) : (
          <>
            {connectedWallet ? (
              <img
                src={connectedWallet.icon}
                className="h-5"
                alt="wallet icon"
              ></img>
            ) : null}
            <p>
              {isMobile ? null : prefix}
              {isMobile ? "" : abbreviateAddress(connectedWalletAddress)}
            </p>
          </>
        )}
      </div>
      <Disconnect
        ref={disconnectButtonMenu.ref}
        isShown={disconnectButtonMenu.visible}
        onClick={disconnectWallet}
        isMobile={isMobile}
      ></Disconnect>
    </div>
  );
}
