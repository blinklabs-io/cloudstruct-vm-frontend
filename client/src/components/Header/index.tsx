import { faBars, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logoDark from "src/assets/cloudstruct-dark.png";
import logoLight from "src/assets/cloudstruct-light.png";
import { Blockchain, Themes } from "src/entities/common.entities";
import { toggleMenu, toggleTheme } from "src/reducers/globalSlice";
import { RootState } from "src/store";
import BlockchainSelector from "../BlockchainSelector";
import CardanoWalletSelector from "../WalletSelector/CardanoWalletSelector";
import ErgoWalletSelector from "../WalletSelector/ErgoWalletSelector";

function Header() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.global.theme);
  const chain = useSelector((state: RootState) => state.global.chain);

  const RenderWalletConnector = () => {
    switch (chain) {
      case Blockchain.cardano:
        return <CardanoWalletSelector></CardanoWalletSelector>;
      case Blockchain.ergo:
        return <ErgoWalletSelector></ErgoWalletSelector>;
    }
  };

  return (
    <>
      {/* Web header */}
      <div className="flex-row items-center max-w-8xl w-full p-5 pb-0 hidden sm:flex">
        <Link to="/">
          <div className="">
            <img
              src={theme === Themes.dark ? logoDark : logoLight}
              className="h-20 logo"
              alt="cloudstruct logo"
            ></img>
          </div>
        </Link>
        <div className="flex flex-row gap-4 items-center ml-auto mr-2.5">
          <RenderWalletConnector></RenderWalletConnector>
        </div>
      </div>

      {/* Mobile header */}
      <div className="w-full flex flex-row items-center justify-center p-5 pb-0 h-fit sm:hidden">
        <div className="flex flex-row items-center mr-auto w-14">
          <button
            className="background shadow-lg rounded-lg py-2.5 w-full"
            onClick={() => dispatch(toggleMenu())}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div>
          <img
            src={theme === Themes.dark ? logoDark : logoLight}
            className="h-14 mr-2.5 logo"
            alt="cloudstruct logo"
          ></img>
        </div>
        {chain === Blockchain.cardano ? (
          <CardanoWalletSelector></CardanoWalletSelector>
        ) : null}
      </div>
    </>
  );
}

export default Header;
