import { logger } from "../../../utils/winston"
import { HttpProxyConfig } from "../../proxy/http_proxy"
import FirewallRule from "../FirewallRule"
import express from 'express'

export default class AlwaysBlockRule extends FirewallRule {
    constructor() {
        super("#Always block")
    }

    public getHandler(config: HttpProxyConfig, req: express.Request, res: express.Response): boolean {
        logger.warn(`${this.name} --- ${config.hostname} --- ${req.ip} --- Blocked`)
        res.writeHead(400);
        res.end('Bad request');
        return false
    }
}