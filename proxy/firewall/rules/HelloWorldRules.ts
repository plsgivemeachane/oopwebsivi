import { HttpProxyConfig } from "../../proxy/http_proxy";
import FirewallRule from "../FirewallRule";
import express from "express";

export default class HelloWorldRules extends FirewallRule {

    constructor() {
        super("HelloWorldRules")
    }

    public getHandler(config: HttpProxyConfig, req: express.Request, res: express.Response): boolean {
        res.writeHead(200, {
            "Content-Type": "text/plain",
        });
        res.end("Hello World!");

        return false
    }

}