import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageRoute } from "src/entities/common.entities";

import Loading from "src/pages/Loading";

const Claim = lazy(() => import("src/pages/Cardano/Claim"));
const ClaimHistory = lazy(() => import("src/pages/Cardano/ClaimHistory"));
const DepositInfoPage = lazy(() => import("src/pages/Cardano/Deposit"));
const Pools = lazy(() => import("src/pages/Cardano/Pools"));
const Projects = lazy(() => import("src/pages/Cardano/Projects"));
const Feedback = lazy(() => import("src/pages/Feedback"));

export default function RouterWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={PageRoute.claimCardano} element={<Claim />} />
        <Route path={PageRoute.historyCardano} element={<ClaimHistory />} />
        <Route path={PageRoute.depositCardano} element={<DepositInfoPage />} />
        <Route path={PageRoute.projectsCardano} element={<Projects />} />
        <Route path={PageRoute.poolsCardano} element={<Pools />} />
        <Route path={PageRoute.feedback} element={<Feedback />} />
        {/* <Route path={PageRoute.claimErgo} element={<ComingSoonPage />} /> */}
        <Route path="*" element={<Navigate to={PageRoute.claimCardano} />} />
      </Routes>
    </Suspense>
  );
}
