import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CardanoLogo from "src/assets/cardanologo.svg";
import ErgoLogo from "src/assets/ergologo.svg";
import { PageRoute } from "src/entities/common.entities";
import useComponentVisible from "src/hooks/useComponentVisible";
import { RootState } from "src/store";

const NETWORK_INFO = {
  cardano: {
    text: "Cardano",
    img: CardanoLogo,
    to: PageRoute.claimErgo,
    toImg: ErgoLogo,
    toText: "Ergo",
  },
  ergo: {
    text: "Ergo",
    img: ErgoLogo,
    to: PageRoute.claimCardano,
    toImg: CardanoLogo,
    toText: "Cardano",
  },
};

export default function BlockchainSelector({
  isMobile,
}: {
  isMobile: boolean;
}) {
  const chain = useSelector((state: RootState) => state.global.chain);
  const network = NETWORK_INFO[chain];
  const { ref, visible, setVisible } = useComponentVisible(false);

  return (
    <div
      className={`h-full ${isMobile ? "w-full" : "w-32"} relative`}
      ref={ref}
    >
      <button
        className={`${
          isMobile ? "w-full h-full" : "px-5"
        } h-full background shadow-lg rounded-lg py-2.5 flex items-center justify-center gap-2`}
        onClick={() => setVisible(!visible)}
      >
        <img alt="blockchain logo" className="h-5" src={network.img}></img>
        {isMobile ? null : network.text}
      </button>
      {visible ? (
        <Link to={"#"} onClick={() => setVisible(false)}>
          <button
            className="h-full absolute mt-2.5 w-full background shadow-lg rounded-lg px-5 py-2.5 flex items-center justify-center gap-2"
            disabled={true} // disabled until ergo is ready
          >
            <img
              alt="blockchain logo"
              className="h-5"
              src={network.toImg}
            ></img>
            {isMobile ? null : network.toText}
          </button>
        </Link>
      ) : null}
    </div>
  );
}
