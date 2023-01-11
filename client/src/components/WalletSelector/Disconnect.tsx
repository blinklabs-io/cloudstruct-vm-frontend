import { faLinkSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef } from "react";

interface Props {
  onClick: () => void;
  isShown: boolean;
  isMobile: boolean;
}

const Disconnect = forwardRef<HTMLDivElement, Props>(
  ({ onClick, isShown, isMobile }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={
          "absolute top-14 w-full background py-2.5 px-5 rounded-lg cursor-pointer flex items-center gap-2" +
          (isShown ? "" : " hidden")
        }
      >
        <FontAwesomeIcon className={isMobile ? "" : "mr-2.5"} icon={faLinkSlash} />
        {isMobile ? null : "Disconnect"}
      </div>
    );
  }
);

export default Disconnect;
