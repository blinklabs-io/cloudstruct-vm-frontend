import { useDispatch } from "react-redux";
import { ModalTypes } from "src/entities/common.entities";
import useWallet from "src/hooks/useWallet";
import { showModal } from "src/reducers/globalSlice";
import WalletSelector from "./WalletSelector";

interface Props {
  isMobile: boolean;
}

function CardanoWalletSelector({ isMobile }: Props) {
  const { connectWallet } = useWallet();

  const dispatch = useDispatch();

  const showWalletSelection = () => {
    dispatch(
      showModal({
        modalType: ModalTypes.wallet,
      })
    );
  };

  return (
    <WalletSelector
      disconnectWallet={() => connectWallet()}
      showWalletSelection={showWalletSelection}
      walletState={walletState}
      walletInfo={walletInfo}
      isMobile={isMobile}
    ></WalletSelector>
  );
}

export default CardanoWalletSelector;
