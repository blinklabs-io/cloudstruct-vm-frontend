import { faBars, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logoDark from "src/assets/cloudstruct-dark.png";
import logoLight from "src/assets/cloudstruct-light.png";
import WalletSelector from "src/components/WalletSelector";
import { Blockchain, Themes } from "src/entities/common.entities";
import useWallet from "src/hooks/useWallet";
import { toggleMenu, toggleTheme } from "src/reducers/globalSlice";
import { RootState } from "src/store";

function Header() {
  const dispatch = useDispatch();
  const { connectWallet } = useWallet();
  const theme = useSelector((state: RootState) => state.global.theme);
  const chain = useSelector((state: RootState) => state.global.chain);

  const RenderWalletConnector = () => {
    switch (chain) {
      case Blockchain.cardano:
        return (
          <WalletSelector connectWallet={connectWallet} isMobile={false} />
        );
      case Blockchain.ergo:
        return null;
    }
  };

  return (
    <>
      {/* Web header */}
      <div className="flex-row items-center w-5/6 p-5 pb-0 hidden sm:flex">
        <Link to="/">
          <div className="ml-2.5 rounded-lg">
            <img
              src={theme === Themes.dark ? logoDark : logoLight}
              className="h-10 logo"
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
            className="h-10 mr-2.5 logo"
            alt="cloudstruct logo"
          ></img>
        </div>
        {chain === Blockchain.cardano ? (
          <WalletSelector connectWallet={connectWallet} isMobile={true} />
        ) : null}
      </div>
    </>
  );
}

export default Header;
