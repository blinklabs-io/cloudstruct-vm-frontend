import Pool from "src/components/Pool";
import usePools from "src/hooks/cardano/pools/usePools";
import Loading from "src/pages/Loading";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Pools = () => {
  const { pools, loading } = usePools();

  return loading ? (
    <Loading></Loading>
  ) : (
    <>
      <p className="text-3xl">Eligible Stake Pools</p>
      <div
        className={
          "background shadow-2xl rounded-2xl p-5 flex flex-row items-center gap-2"
        }
      >
        <div className="text-premium">
          <FontAwesomeIcon icon={faLightbulb} />
        </div>
        Delegators to stake pools listed below can use this claims service
        at no additional charge
      </div>
      <div className="flex flex-col gap-4">
        {pools.map((pool) => (
          <Pool key={pool.ticker} pool={pool}></Pool>
        ))}
      </div>
    </>
  );
};

export default Pools;
