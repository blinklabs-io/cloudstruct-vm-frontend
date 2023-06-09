import express from "express";
import { CLAIM_ADMIN_KEY } from "..";
import { Dto } from "../../client/src/entities/dto";
import { typedErrorHandlerWrapper } from "../middlewares/error-handler";
import { persistentCache } from "../utils/cache";
import { createErrorWithCode, HttpStatusCode } from "../utils/error";
const router = express.Router();

router.post(
  "/banner",
  typedErrorHandlerWrapper<Dto.PostBannerText>(async (req, res) => {
    const { adminKey, text } = req.body;

    if (adminKey !== CLAIM_ADMIN_KEY) {
      throw createErrorWithCode(HttpStatusCode.UNAUTHORIZED, "Wrong admin key");
    }

    persistentCache.set("banner", text);

    return res.status(200).send({});
  })
);

router.get(
  "/banner",
  typedErrorHandlerWrapper<Dto.GetBannerText>(async (_, res) => {
    const text = persistentCache.get("banner") as string;
    return res.status(200).send({
      text: text ?? "",
    });
  })
);

export default router;
