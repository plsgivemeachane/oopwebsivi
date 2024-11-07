import InjectableRequest from "../../requests/InjectableRequest";
import http from 'http'
import SiviBuilder from "./sivi_builder";
import express from 'express'
import AbstractProxy from "./AbstractProxy";
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpProxyConfig {
    protocol?: any
    port?: number
    hostname?: string
    path?: string
    method?: HttpMethod
    headers?: any
}

/**
 * The HttpProxy class represents an HTTP proxy server.
 * It provides methods to get the HTTP handler of the proxy server.
 * 
 * The HttpProxy class is responsible for setting up the HTTP proxy server.
 * It creates an HTTP server, and sets up the routes for the HTTP server.
 */
export default class HttpProxy extends AbstractProxy {
    readonly config: HttpProxyConfig;
    readonly requestHandler: InjectableRequest;
    readonly name: string;

    constructor(port: number, hostname: string, path: string = "/", name: string = "HttpProxy") {
        super()
        this.config = {
            protocol:"http:", port, hostname, path
        }
        this.requestHandler = new InjectableRequest()
        this.name = name
    }

    
    getProxySivi(config: HttpProxyConfig, res: express.Response) {
        return new SiviBuilder().sivi_config(config).res(res).build()
    }

}