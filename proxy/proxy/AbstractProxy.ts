import { logger } from "../../utils/winston";
import { HttpMethod, HttpProxyConfig } from "../proxy/http_proxy";
import InjectableRequest from "../requests/InjectableRequest";
import express from 'express'

/**
 * The AbstractProxy class is an abstract class that represents a proxy server.
 * It provides methods to get the HTTP handler of the proxy server.
 * It also provides methods to get the configuration of the proxy server.
 * 
 * The AbstractProxy class is responsible for setting up the proxy server.
 * It creates an HTTP server, and sets up the routes for the HTTP server.
 */
export default abstract class AbstractProxy {
    readonly config: HttpProxyConfig | undefined;
    readonly requestHandler: InjectableRequest = new InjectableRequest();

    constructor() {}

    abstract getProxySivi(config: HttpProxyConfig, res: express.Response): any
    public setup(): void {
        logger.info("Setting up proxy...");
        console.dir(this.config, {
            depth: null,
            colors: true
        })
        this.requestHandler.addRouteAsynchronous((req, res) => {
            const extended_config: HttpProxyConfig = {
                ...this.config,
                method: req.method as HttpMethod,
                headers: req.headers as any,
                path: req.path
            }

            const proxySivi = this.getProxySivi(extended_config, res)

            req.pipe(proxySivi, { 
                end: true // Auto close stream connection
            });

            proxySivi.on('error', (err: any) => {
                console.error(`HTTP Proxy error: ${err.message}`);
                res.writeHead(500);
                res.end('Internal Server Error');
            });
        })
    }
    
    public getHandler() {
        // logger.info("----------->" + this.config?.hostname)
        return this.requestHandler.getHandler()
    }
    // abstract start(): Promise<void>
}