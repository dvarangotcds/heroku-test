import { NextFunction, Request, Response, Router } from "express"
import * as config from ".././config"
const healthChecker = Router()
import { logger } from ".././services"

export default async function performCheckAsync(req: Request, res: Response) {
  const configErrors = await config.validateAllAsync()

  if (configErrors.length > 0) {
    logger.error(configErrors)
    res.status(500).contentType("text/plain").send("ERROR")
  } else {
    res.status(200).contentType("text/plain").send("OK")
  }
}
