import { useEffect, useState } from "react";
import { StakePoolInfo } from "src/entities/common.entities";
import useErrorHandler from "src/hooks/useErrorHandler";
import { getFeaturedPools } from "src/services/common";

export default function useFeaturedPools() {
  const [featLoading, setFeatLoading] = useState<boolean>(true);
  const [featPools, setFeatPools] = useState<StakePoolInfo[]>([]);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchFeatPools = async () => {
      try {
        let featPools = await getFeaturedPools();
        featPools = featPools.filter((featPool) => featPool.visible === "t");
        setFeatPools(featPools);
      } catch (error) {
        handleError(error);
      } finally {
        setFeatLoading(false);
      }
    };
    fetchFeatPools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    featPools,
    featLoading,
  };
}
