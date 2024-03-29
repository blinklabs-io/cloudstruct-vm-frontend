import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Spinner from "src/components/Spinner";
import {
  InfoModalTypes,
  ModalTypes,
  PageRoute,
} from "src/entities/common.entities";
import { ClaimableToken } from "src/entities/vm.entities";
import { showModal } from "src/reducers/globalSlice";
import { getCustomRewards, getRewards } from "src/services/claim";
import { RootState } from "src/store";

import ClaimableTokenBox from "src/components/Claim/ClaimableTokenBox";
import useErrorHandler from "src/hooks/useErrorHandler";
import { getStakeKey } from "src/services/common";

function Claim() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const connectedWallet = useSelector(
    (state: RootState) => state.wallet.walletApi
  );
  const { handleError } = useErrorHandler();

  const isWrongNetwork = useSelector(
    (state: RootState) => state.wallet.isWrongNetwork
  );
  const [hideCheck, setHideCheck] = useState(false);
  const [hideStakingInfo, setHideStakingInfo] = useState(true);

  const [claimableTokens, setClaimableTokens] = useState<ClaimableToken[]>([]);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [numberOfSelectedTokens, setNumberOfSelectedTokens] = useState(0);
  const [numberOfSelectedPremiumTokens, setNumberOfSelectedPremiumTokens] =
    useState(0);

  const [searchAddress, setSearchAddress] = useState<string>("");
  const [rewardsLoader, setRewardsLoader] = useState(false);
  const [stakeAddress, setStakeAddress] = useState<string>("");
  const [claimMyRewardLoading, setClaimMyRewardLoading] =
    useState<boolean>(false);

  const [whitelisted, setWhitelisted] = useState(false);

  useEffect(() => {
    if (claimableTokens.length) {
      setHideStakingInfo(false);
    } else {
      setHideStakingInfo(true);
    }
  }, [claimableTokens]);

  useEffect(() => {
    async function init() {
      if (connectedWallet?.wallet?.api && !isWrongNetwork) {
        setSearchAddress(await connectedWallet.getAddress());
        setHideCheck(false);
        setHideStakingInfo(true);
      }
    }

    init();
  }, [connectedWallet?.wallet?.api, connectedWallet, isWrongNetwork]);

  const getNumberOfPremiumTokens = useCallback(() => {
    return claimableTokens.reduce((prev, token) => {
      if (token.premium && token.ticker !== "ADA") {
        prev += 1;
      }
      return prev;
    }, 0);
  }, [claimableTokens]);

  const getNumberOfSelectedTokens = useCallback(() => {
    return claimableTokens.reduce((prev, token) => {
      if (token.selected) {
        prev += 1;
      }
      return prev;
    }, 0);
  }, [claimableTokens]);

  const getNumberOfSelectedPremiumTokens = useCallback(() => {
    return claimableTokens.reduce((prev, token) => {
      if (token.selected && token.premium && token.ticker !== "ADA") {
        prev += 1;
      }
      return prev;
    }, 0);
  }, [claimableTokens]);

  /**
   * select/unselect all tokens
   */
  const selectAll = () => {
    const updatedClaimableTokens = [...claimableTokens];
    if (
      numberOfSelectedTokens <
      (whitelisted
        ? claimableTokens.length
        : claimableTokens.length - getNumberOfPremiumTokens())
    ) {
      updatedClaimableTokens.forEach(
        (token) =>
          (token.selected = token.premium ? (whitelisted ? true : false) : true)
      );
    } else {
      updatedClaimableTokens.forEach((token) => (token.selected = false));
    }
    setClaimableTokens(updatedClaimableTokens);
    setNumberOfSelectedTokens(getNumberOfSelectedTokens());
    setNumberOfSelectedPremiumTokens(getNumberOfSelectedPremiumTokens());
  };

  /**
   * handle token select
   */
  const handleTokenSelect = (position: number) => {
    const updatedClaimableTokens = [...claimableTokens];
    if (updatedClaimableTokens[position].ticker === "ADA") {
      updatedClaimableTokens[position].selected = true;
    } else if (updatedClaimableTokens[position].premium) {
      if (whitelisted) {
        updatedClaimableTokens[position].selected =
          !updatedClaimableTokens[position].selected;
      }
    } else {
      updatedClaimableTokens[position].selected =
        !updatedClaimableTokens[position].selected;
    }
    setClaimableTokens(updatedClaimableTokens);
    setNumberOfSelectedTokens(getNumberOfSelectedTokens());
    setNumberOfSelectedPremiumTokens(getNumberOfSelectedPremiumTokens());
  };

  const checkRewards = async () => {
    if (searchAddress) {
      setRewardsLoader(true);
      try {
        /**
         * check if the inserted address is cardano address
         * we want the stake address
         * if it is cardano address, get the staking address
         */
        let address = await getStakeKey(searchAddress);

        address = address.staking_address;

        setStakeAddress(address);
        const getRewardsDto = await getRewards(address);
        if (getRewardsDto == null) throw new Error();
        if (getRewardsDto.claimable_tokens.length !== 0) {
          setClaimableTokens(
            getRewardsDto.claimable_tokens
              .map((token) => {
                token.selected = token.ticker === "ADA" ? true : false;
                return token;
              })
              .sort((a, b) => {
                if (a.ticker === "ADA") {
                  return -1;
                } else if (b.ticker === "ADA") {
                  return 1;
                } else if (a.premium === b.premium) {
                  if (a.ticker < b.ticker) {
                    return -1;
                  } else {
                    return a.ticker === "ADA" ? -1 : 1;
                  }
                } else {
                  return a.premium ? -1 : 1;
                }
              })
          );
          if (getRewardsDto.is_whitelisted) setWhitelisted(true);
          setPoolInfo(getRewardsDto.pool_info);
          setRewardsLoader(false);
        } else {
          dispatch(
            showModal({
              modalType: ModalTypes.info,
              details: {
                text: "No rewards found for the account, yet.",
                type: InfoModalTypes.info,
              },
            })
          );
        }
      } catch (e: any) {
        handleError(e);
      } finally {
        setRewardsLoader(false);
      }
    }
  };

  const claimMyRewards = async () => {
    if (numberOfSelectedTokens === 0) return;

    setClaimMyRewardLoading(true);
    let selectedPremiumToken = false;

    const selectedTokenId: string[] = [];
    claimableTokens.forEach((token) => {
      if (token.selected) {
        if (token.premium) {
          selectedPremiumToken = true;
        }
        selectedTokenId.push(token.assetId);
      }
    });

    try {
      const res = await getCustomRewards(
        stakeAddress,
        stakeAddress.slice(0, 40),
        selectedTokenId.join(","),
        selectedPremiumToken
      );
      if (res == null) throw new Error();

      let depositInfoUrl = `${PageRoute.depositCardano}?stakeAddress=${stakeAddress}&withdrawAddress=${res.withdrawal_address}&requestId=${res.request_id}&selectedTokens=${numberOfSelectedTokens}&unlock=${selectedPremiumToken}&isWhitelisted=${res.is_whitelisted}`;
      navigate(depositInfoUrl, { replace: true });
    } catch (e) {
      handleError(e);
    } finally {
      setClaimMyRewardLoading(false);
    }
  };

  const cancelClaim = async () => {
    setClaimableTokens([]);
  };

  const renderStakeInfo = () => {
    if (poolInfo != null) {
      return (
        <>
          {poolInfo.delegated_pool_logo ? (
            <img
              className="h-5 mr-2.5"
              src={poolInfo.delegated_pool_logo}
              alt=""
            />
          ) : (
            ""
          )}
          <div className="pool-info">
            <div className="staking-info">
              Currently staking&nbsp;
              <strong>{poolInfo.total_balance} ADA</strong>
              &nbsp;with&nbsp;
              <strong className="no-break">
                {poolInfo.delegated_pool_name}
                &nbsp; [{poolInfo.delegated_pool_ticker}]
              </strong>
            </div>
          </div>
        </>
      );
    } else {
      return <>Stake pool information not found</>;
    }
  };

  function renderCheckRewardsStep() {
    if (!hideCheck) {
      return (
        <div className="p-5 background text shadow-2xl rounded-2xl flex flex-col gap-4">
          <p>Enter your wallet/stake address or $handle to view your rewards</p>
          <input
            className={`w-full shadow-lg rounded-lg bg-transparent border-gray-400 border p-1 disabled:cursor-not-allowed`}
            type="text"
            value={searchAddress}
            onInput={(e: KeyboardEvent<HTMLInputElement>) =>
              setSearchAddress((e.target as HTMLInputElement).value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkRewards();
              }
            }}
            disabled={
              !hideStakingInfo ||
              (typeof connectedWallet?.wallet?.api !== "undefined" &&
                !isWrongNetwork)
            }
          ></input>
          <div className="flex flex-row items-center">
            <button
              className="cs-button py-2.5 px-5 shadow-lg rounded-lg flex flex-row items-center"
              disabled={!hideStakingInfo}
              onClick={checkRewards}
            >
              Check my rewards
              {rewardsLoader ? (
                <div className="ml-2.5">
                  <Spinner></Spinner>
                </div>
              ) : null}
            </button>
            <button
              className={
                "cs-button py-2.5 px-5 shadow-lg rounded-lg ml-5" +
                (hideStakingInfo ? " hidden" : "")
              }
              onClick={cancelClaim}
            >
              <div className="cs-cancel-text">Cancel</div>
            </button>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  function renderStakingInfoStep() {
    if (!hideStakingInfo) {
      return (
        <div className="flex flex-col gap-4">
          <div
            className={
              "background shadow-2xl rounded-2xl p-5 flex flex-row items-center"
            }
          >
            {renderStakeInfo()}
          </div>
          <div
            className={
              "background shadow-2xl rounded-2xl p-5 flex flex-row items-center gap-2"
            }
          >
            <div className="text-premium">
              <FontAwesomeIcon icon={faStar} />
            </div>
            Starred tokens indicate tokens can be claimed only by CSCS
            delegators
          </div>
          <div className={"flex flex-row flex-wrap gap-4"}>
            {claimableTokens.map((token, index) => {
              return (
                <ClaimableTokenBox
                  key={index}
                  index={index}
                  ticker={token.ticker}
                  price={token.price ?? "N/A"}
                  total={token.total ?? "N/A"}
                  selected={token.ticker === "ADA" ? true : token.selected || false}
                  handleOnChange={handleTokenSelect}
                  amount={token.amount}
                  decimals={token.decimals}
                  logo={token.logo}
                  assetId={token.assetId}
                  premium={token.premium}
                />
              );
            })}
          </div>

          <div
            className={
              "background flex flex-row items-center p-5 shadow-2xl rounded-2xl"
            }
          >
            <div>
              Selected {numberOfSelectedTokens} token
              {numberOfSelectedTokens !== 1 ? "s" : null}
              {numberOfSelectedPremiumTokens !== 0
                ? `, ${numberOfSelectedPremiumTokens} premium tokens`
                : null}
            </div>
            <div className="ml-auto flex flex-row w-fit">
              <button
                className="cs-button py-2.5 px-5 shadow-lg rounded-lg"
                disabled={
                  claimableTokens.length -
                    (whitelisted ? 0 : getNumberOfPremiumTokens()) ===
                  0
                }
                onClick={selectAll}
              >
                {numberOfSelectedTokens +
                  (whitelisted ? 0 : getNumberOfPremiumTokens()) ===
                ((whitelisted
                  ? claimableTokens.length
                  : claimableTokens.length - getNumberOfPremiumTokens()) &&
                  claimableTokens.length !== getNumberOfPremiumTokens())
                  ? "Unselect All"
                  : "Select All"}
              </button>
              <button
                className="cs-button ml-5 py-2.5 px-5 shadow-lg rounded-lg flex flex-row items-center"
                disabled={numberOfSelectedTokens === 0}
                onClick={claimMyRewards}
              >
                Claim my rewards
                {claimMyRewardLoading ? (
                  <div className="ml-2.5">
                    <Spinner></Spinner>
                  </div>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <>
      <p className="text-3xl flex items-center gap-2">Claim your rewards</p>
      <div className="flex flex-col gap-4">
        {renderCheckRewardsStep()}
        {renderStakingInfoStep()}
      </div>
    </>
  );
}

export default Claim;
