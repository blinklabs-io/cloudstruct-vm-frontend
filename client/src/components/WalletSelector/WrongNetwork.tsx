import useComponentVisible from "src/hooks/useComponentVisible";
import Disconnect from "./Disconnect";

export default function WrongNetwork({
  disconnectWallet,
  isMobile,
}: {
  disconnectWallet: () => void;
  isMobile: boolean;
}) {
  const disconnectButtonMenu = useComponentVisible(false);

  const toggleDisconnectButton = () => {
    disconnectButtonMenu.setVisible(!disconnectButtonMenu.visible);
  };

  return (
    <div className="relative w-fit">
      <div
        className={
          "relative rounded-lg background flex items-center justify-center px-5 py-2.5 cursor-pointer"
        }
        onClick={toggleDisconnectButton}
      >
        {isMobile ? null : "WRONG NETWORK"}
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
