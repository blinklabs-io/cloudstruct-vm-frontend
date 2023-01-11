import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Connect({ onClick, isMobile }: { onClick: () => void; isMobile: boolean; }) {
  return (
    <div
      className="rounded-lg shadow-lg background flex items-center justify-center px-5 py-2.5 cursor-pointer h-11"
      onClick={onClick}
    >
      <FontAwesomeIcon className={isMobile ? "" : "mr-2.5"} icon={faWallet} />
      {isMobile ? null : "Connect"}
    </div>
  );
}
