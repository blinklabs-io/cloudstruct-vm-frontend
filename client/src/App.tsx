import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
// import Footer from "src/components/Footer";
import Modal from "src/components/Modal";
import PopUp from "src/components/PopUp";
import RouterWrapper from "src/layouts/RouterWrapper";
import "src/styles.scss";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Blockchain } from "./entities/common.entities";
import BlockchainWrapper from "./layouts/BlockchainWrapper";
import MenuWrapper from "./layouts/MenuWrapper";
import ThemeWrapper from "./layouts/ThemeWrapper";
import { setChain } from "./reducers/globalSlice";

function App() {
  const location = useLocation().pathname;
  const dispatch = useDispatch();

  useEffect(() => {
    const isOnCardano = location.includes("cardano");
    const isOnErgo = location.includes("ergo");
    if (isOnCardano) {
      dispatch(setChain(Blockchain.cardano));
    } else if (isOnErgo) {
      dispatch(setChain(Blockchain.ergo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <ThemeWrapper>
      <>
        <PopUp />
        <Modal />
        <Header />
        <BlockchainWrapper>
          <MenuWrapper>
            <RouterWrapper />
          </MenuWrapper>
        </BlockchainWrapper>
        <Footer />
      </>
    </ThemeWrapper>
  );
}

export default App;
