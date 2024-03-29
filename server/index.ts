import {
  Address,
  BaseAddress,
  RewardAddress,
} from "@emurgo/cardano-serialization-lib-nodejs";
import express, { Request, Response } from "express";
import * as _ from "lodash";
import url from "url";
import {
  GetDeliveredRewardsDto,
  GetPoolsDto,
  GetQueueDto,
  ServerErrorDto,
} from "../client/src/entities/dto";
import { Tip, TransactionStatus } from "../client/src/entities/koios.entities";
import { PoolInfo } from "../client/src/entities/vm.entities";
import {
  CardanoNetwork,
  getAccountsInfo,
  getDeliveredRewards,
  getEpochParams,
  getFromKoios,
  getFromVM,
  getPoolMetadata,
  getPools,
  getPrices,
  getRewards,
  getTokens,
  ICSFeatures,
  IVMSettings,
  postFromKoios,
  translateAdaHandle,
} from "./utils";
import { ICustomRewards } from "./utils/entities";
import { logError } from "./utils/error";

require("dotenv").config();
const fs = require("fs");
const CARDANO_NETWORK = process.env.CARDANO_NETWORK || CardanoNetwork.preview;
const CLOUDFLARE_PSK = process.env.CLOUDFLARE_PSK;
const LOG_TYPE = process.env.LOG_TYPE || "dev";
const PORT = process.env.PORT || 3000;
const CLAIM_FEE = process.env.CLAIM_FEE || 500000;
const CLAIM_FEE_WHITELIST = process.env.CLAIM_FEE_WHITELIST;
const VM_KOIOS_URL = process.env.KOIOS_URL_TESTNET || process.env.KOIOS_URL;
const CLAIM_ENABLED = process.env.CLAIM_ENABLED === "true";
const ERGO_ENABLED = process.env.ERGO_ENABLED === "true";

const app = express();
app.use(express.json());
app.use(require("morgan")(LOG_TYPE));

/**
 * Serve static files for our React app
 */
app.use(express.static("../client/build"));

const server = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server shutting down");
  });
});

app.get("/api/getprices", async (req, res) => {
  const prices = await getPrices();
  return res.status(200).send(prices);
});

app.get(
  "/api/getpools",
  async (req, res: Response<GetPoolsDto>) => {
    const pools = await getPools();

    /** did this because value in env use 'pool...' as ID whereas VM retuns pool ID */
    const whitelistedPoolTickers = ["BBHMM", "OTG", "PSB", "SEAL", "APEX"];
    const whitelistedPools: PoolInfo[] = [];
    const regularPools: PoolInfo[] = [];
    Object.values(pools).forEach((pool) => {
      if (pool.visible === "f" || pool.id.includes("project_")) {
        return;
      }
      if (whitelistedPoolTickers.includes(pool.ticker)) {
        whitelistedPools.push(pool);
      } else {
        regularPools.push(pool);
      }
    });
    return res.status(200).send({
      whitelistedPools: _.shuffle(whitelistedPools),
      regularPools: _.shuffle(regularPools),
    });
  }
);

app.get("/api/gettokens", async (req, res) => {
  const tokens = await getTokens();
  return res.status(200).send(tokens);
});

app.get("/api/getsettings", async (req, res) => {
  const settings: IVMSettings = await getFromVM("get_settings");
  return res.status(200).send(settings);
});

app.get("/api/systeminfo", async (req, res) => {
  const systeminfo = await getFromVM("system_info");
  return res.status(200).send(systeminfo);
});

app.get("/health", (req: any, res: any) => {
  res.status(200).json({
    status: "UP",
  });
});

app.get("/healthz", async (req: any, res: any) => {
  try {
    const getTipResponse = await getFromKoios<Tip[]>(`tip`);
  } catch (error: any) {
    return res.status(502).send({ error: "Failed to get tip from Koios" });
  }
  if (CLOUDFLARE_PSK) {
    if (req.headers["x-cloudflare-psk"]) {
      const myPsk = req.headers["x-cloudflare-psk"];
      if (myPsk == CLOUDFLARE_PSK) {
        const authResponse = await getFromVM("is_authenticated");
        res.send(authResponse);
      } else {
        res.status(403).json({
          error: "PSK invalid",
        });
      }
    } else {
      res.status(401).json({
        error: "PSK missing",
      });
    }
  } else {
    res.status(200).json({
      status: "UP",
    });
  }
});

app.get("/features", (req: any, res: any) => {
  const features: ICSFeatures = {
    claim_fee: Number(CLAIM_FEE),
    claim_fee_whitelist: CLAIM_FEE_WHITELIST,
    claim_enabled: CLAIM_ENABLED,
    network: CARDANO_NETWORK,
    ergo_enabled: ERGO_ENABLED,
  };

  return res.status(200).send(features);
});

app.get(
  "/api/getstakekey",
  async (req: any, res: any) => {
    try {
      const queryObject = url.parse(req.url, true).query;
      let address = queryObject.address as string;
      let translatedAddress;

      if (!address)
        return res.status(400).send({ error: "Address seems invalid" });
      if (!VM_KOIOS_URL)
        return res.status(500).send({ error: "KOIOS URL is not defined" });

      const prefix = address.slice(0, 5);

      switch (true) {
        /**
         * for ADA Handle, translate the handle
         * to a functional address
         */
        case prefix[0] === "$":
          translatedAddress = await translateAdaHandle(
            address,
            CARDANO_NETWORK,
            VM_KOIOS_URL
          );
          address = translatedAddress;
          break;
        case prefix === "addr_":
          if (CARDANO_NETWORK === CardanoNetwork.mainnet)
            return res
              .status(400)
              .send({ error: "Inserted address is for a testnet" });
          break;
        case prefix === "addr1":
          if (CARDANO_NETWORK === CardanoNetwork.preview)
            return res
              .status(400)
              .send({ error: "Inserted address is for mainnet" });
          break;
        case prefix === "stake":
          // We were given a stake address, pass it through
          return res.send({ staking_address: address });
          break;
        default:
          return res.status(400).send({ error: "Address seems invalid" });
      }

      let rewardAddressBytes = new Uint8Array(29);
      switch (CARDANO_NETWORK) {
        case CardanoNetwork.mainnet:
          rewardAddressBytes.set([0xe1], 0);
          break;
        case CardanoNetwork.preview:
        default:
          rewardAddressBytes.set([0xe0], 0);
          break;
      }

      const addressObject = Address.from_bech32(address);
      const baseAddress = BaseAddress.from_address(addressObject);
      if (baseAddress == null) return null;
      rewardAddressBytes.set(
        baseAddress.stake_cred().to_bytes().slice(4, 32),
        1
      );

      let rewardAddress = RewardAddress.from_address(
        Address.from_bytes(rewardAddressBytes)
      );

      if (rewardAddress == null) return null;

      return res.send({
        staking_address: rewardAddress.to_address().to_bech32(),
      });
    } catch (error: any) {
      return res.status(500).send({
        error:
          "Failed to get the stake key. Are you sure the inserted address is correct?",
      });
    }
  }
);

/**
 * @description get rewards available for user
 * @query
 * - address: user stake address
 */
app.get(
  "/api/getrewards",
  async (req: any, res: any) => {
    try {
      const queryObject = url.parse(req.url, true).query;
      const stakeAddress = queryObject.address as string;
      let isWhitelisted = false;
      if (!stakeAddress)
        return res
          .status(400)
          .send({ error: "No address provided to /api/getrewards" });

      let claimableTokens = await getRewards(stakeAddress);
      const accountsInfo = await getAccountsInfo(stakeAddress);
      const poolInfo = await getPoolMetadata(accountsInfo[0]);
      if (CLAIM_FEE_WHITELIST) {
        const whitelist = CLAIM_FEE_WHITELIST.split(",");
        const accountsInfo = await getAccountsInfo(`${stakeAddress}`);
        const accountInfo = accountsInfo[0];
        if (whitelist.includes(accountInfo.delegated_pool))
          isWhitelisted = true;
        // else `&overhead_fee=${CLAIM_FEE}&unlocks_special=true`
      }

      const consolidatedGetRewards = {
        pool_info: poolInfo,
        claimable_tokens: claimableTokens,
        is_whitelisted: isWhitelisted,
      };

      return res.send(consolidatedGetRewards);
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/getrewards" });
    }
  }
);

app.get(
  "/api/getcustomrewards",
  async (req: any, res: any) => {
    try {
      const queryObject = url.parse(req.url, true).query;
      const { staking_address, session_id, selected, unlock } = queryObject;
      let vmArgs = `custom_request&staking_address=${staking_address}&session_id=${session_id}&selected=${selected}&xwallet=true`;
      let isWhitelisted = false;

      if (!staking_address)
        return res.status(400).send({ error: "staking_address required" });

      if (CLAIM_FEE_WHITELIST) {
        const whitelist = CLAIM_FEE_WHITELIST.split(",");
        const accountsInfo = await getAccountsInfo(`${staking_address}`);
        const accountInfo = accountsInfo[0];
        if (whitelist.includes(accountInfo.delegated_pool))
          isWhitelisted = true;
        // else `&overhead_fee=${CLAIM_FEE}&unlocks_special=true`
      }
      vmArgs += `&unlocks_special=${isWhitelisted}`;

      const submitCustomReward: any = await getFromVM(vmArgs);

      if (submitCustomReward == null) {
        throw new Error();
      }

      const customReward: ICustomRewards = {
        request_id: submitCustomReward.request_id,
        deposit: submitCustomReward.deposit,
        overhead_fee: submitCustomReward.overhead_fee,
        withdrawal_address: submitCustomReward.withdrawal_address,
        is_whitelisted: isWhitelisted,
      };

      return res.send(customReward);
    } catch (e: any) {
      logError(e);
      return res
        .status(500)
        .send({ error: "An error occurred in /api/getcustomrewards" });
    }
  }
);

app.get(
  "/api/getdeliveredrewards",
  async (req: any, res: Response<GetDeliveredRewardsDto | ServerErrorDto>) => {
    try {
      const queryObject = url.parse(req.url, true).query;
      const { staking_address: stakingAddress } = queryObject;
      if (!stakingAddress) {
        return res
          .status(400)
          .send({ error: "No address provided to /api/getdeliveredrewards" });
      }

      const deliveredRewards = await getDeliveredRewards(
        stakingAddress as string
      );

      return res.status(200).send({
        deliveredRewards,
      });
    } catch (e: any) {
      logError(e);
      return res
        .status(500)
        .send({ error: "An error occurred in /api/getdeliveredrewards" });
    }
  }
);

app.get(
  "/api/txstatus",
  async (req, res) => {
    try {
      const queryObject = url.parse(req.url, true).query;
      const { request_id, session_id } = queryObject;

      if (!request_id || !session_id)
        return res
          .status(400)
          .send({ error: "Missing request or session ID in /api/txstatus" });

      const txStatus = await getFromVM(
        `check_status_custom_request&request_id=${request_id}&session_id=${session_id}`
      );
      return res.send(txStatus);
    } catch (e: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/txstatus" });
    }
  }
);

app.get(
  "/api/gettransactionstatus",
  async (req: any, res: any) => {
    try {
      const queryObject = url.parse(req.url, true).query;
      if (queryObject.txHash) {
        const getTransactionStatusResponse = await postFromKoios<
          TransactionStatus[]
        >(`tx_status`, { _tx_hashes: [queryObject.txHash] });
        res.send(getTransactionStatusResponse);
      } else {
        res.status(400).send({ error: "Tx hash seems invalid" });
      }
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/gettransactionstatus" });
    }
  }
);

app.get(
  "/api/getabsslot",
  async (req: any, res: any) => {
    try {
      const getTipResponse = await getFromKoios<Tip[]>(`tip`);
      res.send({
        abs_slot:
          getTipResponse && getTipResponse.length
            ? getTipResponse[0].abs_slot
            : 0,
      });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/getabsslot" });
    }
  }
);

app.get(
  "/api/getblock",
  async (req: any, res: any) => {
    try {
      const getTipResponse = await getFromKoios<Tip[]>(`tip`);
      res.send({
        block_no:
          getTipResponse && getTipResponse.length
            ? getTipResponse[0].block_no
            : 0,
      });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/getblock" });
    }
  }
);

app.get(
  "/api/gettip",
  async (req: any, res: any) => {
    try {
      const getTipResponse = await getFromKoios<Tip[]>(`tip`);
      res.send(getTipResponse[0]);
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/gettip" });
    }
  }
);

app.get(
  "/api/getepochparams",
  async (req: any, res: any) => {
    try {
      const getTipResponse = await getFromKoios<Tip[]>(`tip`);
      const getEpochParamsResponse = await getEpochParams(
        getTipResponse && getTipResponse.length ? getTipResponse[0].epoch_no : 0
      );
      res.send(getEpochParamsResponse);
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: "An error occurred in /api/getepochparams" });
    }
  }
);

app.get(
  "/api/getfeaturedpools",
  async (req: any, res: any) => {
    const pools = JSON.parse(
      fs.readFileSync(__dirname + "/public/json/pools.json", "utf8")
    );
    return res.status(200).send(pools);
  }
);

app.get(
  "/api/getprojects",
  async (req: any, res: any) => {
    const projects = JSON.parse(
      fs.readFileSync(__dirname + "/public/json/projects.json", "utf8")
    );
    return res.status(200).send(projects);
  }
);

app.get(
  "/api/getpopupinfo",
  async (req: any, res: any) => {
    const popupInfo = JSON.parse(
      fs.readFileSync(__dirname + "/public/json/popup.json", "utf8")
    );
    return res.status(200).send(popupInfo);
  }
);

app.get("/api/getqueue", async (req: Request, res: Response<GetQueueDto>) => {
  const queue: GetQueueDto = await getFromVM("get_pending_tx_count");
  return res.status(200).send(queue);
});

// host static files such as images
app.use("/api/img", express.static(__dirname + "/public/img"));

// Fallback to React app
app.get("*", (req, res) => {
  res.sendFile("client/build/index.html", { root: "../" });
});
