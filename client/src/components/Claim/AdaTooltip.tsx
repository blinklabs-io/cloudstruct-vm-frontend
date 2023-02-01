import { faMoneyBillAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AdaTooltip() {
  return (
    <span className="premium-token tooltip-activator ml-auto">
      <FontAwesomeIcon
        className="text-premium cursor-help premium-pulse"
        icon={faMoneyBillAlt}
      />
      <div className="tooltip w-64 p-3.5 rounded-2xl right-5 bottom-5 absolute">
        ADA is always returned if it is available for claim.
      </div>
    </span>
  );
}
