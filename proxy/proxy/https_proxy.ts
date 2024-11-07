
import HttpProxy, { HttpMethod, HttpProxyConfig } from "./http_proxy";
import https from 'https'
import SiviBuilder from "./sivi_builder";
import express from 'express'
import AbstractProxy from "./AbstractProxy";
import fs from 'fs'
import InjectableRequest from "../../requests/InjectableRequest";

export default class HttpsProxy extends AbstractProxy {
    readonly config: HttpProxyConfig;
    readonly requestHandler: InjectableRequest;
    readonly name: string;

    constructor(port: number, hostname: string, path: string = "/", name: string) {
        super()
        this.config = {
            protocol: "https:", port, hostname, path
        }

        this.requestHandler = new InjectableRequest()
        this.name = name
    }

    /**
     * @override getProxySivi for https
     */
    getProxySivi(config: HttpProxyConfig, res: express.Response) {
        return new SiviBuilder().sivi_config(config).res(res).https().build()
    }
}