import { faLinkSlash, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "src/components/Spinner";
import { ModalTypes } from "src/entities/common.entities";
import useComponentVisible from "src/hooks/useComponentVisible";
import { showModal } from "src/reducers/globalSlice";
import { WalletKeys } from "src/services/connectors/wallet.connector";
import { RootState } from "src/store";
import { abbreviateAddress } from "src/utils";

interface Props {
  connectWallet: (walletKey?: WalletKeys) => void;
  isMobile: boolean;
}

function WalletSelector({ connectWallet, isMobile }: Props) {
  const dispatch = useDispatch();
  const connectedWallet = useSelector(
    (state: RootState) => state.wallet.walletApi
  );
  const isWrongNetwork = useSelector(
    (state: RootState) => state.wallet.isWrongNetwork
  );
  const networkId = useSelector((state: RootState) => state.wallet.networkId);

  const disconnectButtonMenu = useComponentVisible(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletIcon, setWalletIcon] = useState("");
  // const [walletIcon, setWalletIcon] = useState(`${faWallet}`);

  const disconnectWallet = () => {
    disconnectButtonMenu.setVisible(false);
    setWalletIcon("");
    connectWallet();
  };

  const toggleDisconnectButton = () => {
    disconnectButtonMenu.setVisible(!disconnectButtonMenu.visible);
  };

  useEffect(() => {
    async function init() {
      if (connectedWallet?.wallet?.api) {
        const addr = abbreviateAddress(await connectedWallet.getAddress());
        setWalletAddress(addr);
        setWalletIcon(connectedWallet.wallet.icon);
      } else {
        setWalletAddress("");
        setWalletIcon("");
      }
    }

    init();
  }, [connectedWallet]);

  const ConnectedButton = () => {
    return (
      <div
        className={`${
          isMobile ? "w-14 h-full" : "px-5"
        } shadow-lg rounded-lg background flex items-center justify-center py-2.5 cursor-pointer gap-2`}
        onClick={() => toggleDisconnectButton()}
      >
        {walletIcon ? (
          <>
            <img src={walletIcon} className="h-5" alt="wallet icon"></img>
            <p>
              {networkId === 0 ? "(preview) " : null}
              {isMobile ? null : walletAddress}
            </p>
          </>
        ) : (
          <div className="flex flex-row items-center gap-2">
            <Spinner></Spinner>
            {isMobile ? null : "Connecting"}
          </div>
        )}
      </div>
    );
  };

  const NotConnectedButton = () => (
    <div
      className={`${
        isMobile ? "px-5" : "px-5"
      } shadow-lg rounded-lg background flex items-center justify-center py-2.5 cursor-pointer`}
      onClick={() =>
        dispatch(
          showModal({
            modalType: ModalTypes.wallet,
          })
        )
      }
    >
      {walletIcon ? (
        <>
          {isMobile ? (
            <FontAwesomeIcon icon={faWallet} />
          ) : (
            <img src={walletIcon} className="h-5" alt="wallet icon"></img>
          )}
        </>
      ) : (
        <p>
          <FontAwesomeIcon className={isMobile ? "" : "mr-2.5"} icon={faWallet} />
          {isMobile ? null : "Connect"}
        </p>
      )}
    </div>
  );

  const WrongNetworkButton = () => (
    <div
      className={
        "shadow-lg rounded-lg background flex items-center justify-center px-5 py-2.5 cursor-pointer"
      }
      onClick={() => toggleDisconnectButton()}
    >
      <p>WRONG NETWORK</p>
    </div>
  );

  return (
    <div className="relative text">
      {isWrongNetwork ? (
        <WrongNetworkButton />
      ) : connectedWallet?.wallet?.api ? (
        <ConnectedButton />
      ) : (
        <NotConnectedButton />
      )}
      <div
        ref={disconnectButtonMenu.ref}
        className={
          "absolute top-14 w-full background py-2.5 px-5 shadow-lg rounded-lg cursor-pointer flex items-center" +
          (connectedWallet?.wallet?.api && disconnectButtonMenu.visible
            ? ""
            : " hidden")
        }
        onClick={disconnectWallet}
      >
        <FontAwesomeIcon className={isMobile ? "" : "mr-2.5"} icon={faLinkSlash} />
        {isMobile ? null : "Disconnect"}
      </div>
    </div>
  );
}

export default WalletSelector;
