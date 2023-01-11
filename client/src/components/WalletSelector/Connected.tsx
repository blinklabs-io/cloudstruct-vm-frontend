import useComponentVisible from "src/hooks/useComponentVisible";
import Spinner from "../Spinner";
import Disconnect from "./Disconnect";

export default function Connected({
  address,
  connecting,
  iconUrl,
  prefix,
  isMobile,
  disconnectWallet,
}: {
  address: string;
  connecting: boolean;
  iconUrl?: string;
  prefix?: string;
  isMobile: boolean;
  disconnectWallet: () => void;
}) {
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
            {iconUrl ? (
              <img src={iconUrl} className="h-5" alt="wallet icon"></img>
            ) : null}
            <p>
              {isMobile ? null : prefix}
              {isMobile ? "" : address}
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
