import AdaTooltip from "../AdaTooltip";
import ClaimFeeTooltip from "../ClaimFeeTooltip";
import TokenInfoTooltip from "../TokenInfoTooltip";

import "./index.scss";

interface Props {
  index: number;
  ticker: string;
  price: string;
  total: string;
  selected: boolean;
  handleOnChange: Function;
  amount: number;
  decimals: number;
  logo: string;
  assetId: string;
  premium: boolean;
}

const ClaimableTokenBox = ({
  index,
  ticker,
  price,
  total,
  selected,
  handleOnChange,
  amount,
  logo,
  premium,
}: Props) => {
  return (
    <div
      className={`box-border cursor-pointer background shadow-2xl rounded-2xl p-4 flex flex-col gap-4 items-center w-full sm:w-60 border-2 duration-200 ${
        selected ? "border-selected" : "border-transparent"
      }`}
      key={index}
      onClick={() => handleOnChange(index)}
    >
      <div className="w-full flex flex-row items-center">
        <div>{ticker}</div>
        <div className="ml-auto flex flex-row align-center gap-2">
          {premium ? <ClaimFeeTooltip></ClaimFeeTooltip> : null}
          {ticker === "ADA" ? <AdaTooltip></AdaTooltip> : null}
        </div>
      </div>
      <img alt="logo" src={logo} className="h-24"></img>
      <div>
        <div className="text-center">
          Quantity: {amount}
        </div>
        <div className="text-center">
          Price: {price}
        </div>
        <div className="text-center">
          Total: {total}
        </div>
      </div>
    </div>
  );
};

export default ClaimableTokenBox;
