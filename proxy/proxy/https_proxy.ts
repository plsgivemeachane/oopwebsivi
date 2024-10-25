
import HttpProxy, { HttpMethod, HttpProxyConfig } from "./http_proxy";
import https from 'https'
import SiviBuilder from "./sivi_builder";
import express from 'express'
import AbstractProxy from "./AbstractProxy";
import fs from 'fs'
import InjectableRequest from "../requests/InjectableRequest";

export default class HttpsProxy extends AbstractProxy {
    readonly config: HttpProxyConfig;
    readonly requestHandler: InjectableRequest;

    constructor(port: number, hostname: string, path: string = "/") {
        super()
        this.config = {
            protocol: "https:", port, hostname, path
        }

        this.requestHandler = new InjectableRequest()
    }

    /**
     * @override getProxySivi for https
     */
    getProxySivi(config: HttpProxyConfig, res: express.Response) {
        return SiviBuilder.build({
            sivi_config: config,
            res
        }, true)
    }
}