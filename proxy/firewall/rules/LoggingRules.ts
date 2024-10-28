import { logger } from "../../../utils/winston"
import { HttpProxyConfig } from "../../proxy/http_proxy"
import FirewallRule from "../FirewallRule"
import express from 'express'

export default class LoggingRules extends FirewallRule {

    private readonly message: string;

    constructor(message: string) {
        super("#Logging rules")
        this.message = message
    }

    public getHandler(config: HttpProxyConfig, req: express.Request, res: express.Response): boolean {
        logger.info(`${this.message}`)
        return true
    }
}