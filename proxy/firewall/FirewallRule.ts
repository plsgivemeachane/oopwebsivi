import { logger } from "../../utils/winston";
import { HttpProxyConfig } from "../proxy/http_proxy";
import express from 'express'

export default class FirewallRule {
    readonly name: string;

    constructor(name: string = "Unconfigured") {
        this.name = name;
    }

    public getHandler(config: HttpProxyConfig, req: express.Request, res: express.Response): boolean {
        logger.warn(`[${this.name}] Unconfigured firewall rule`)
        return true
    }
}