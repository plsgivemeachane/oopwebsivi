import { HttpProxyConfig } from "./http_proxy";
import express from 'express'
import http from 'http'
import https from 'https'

export interface SiviConfig {
    sivi_config: HttpProxyConfig
    res: express.Response
    
}

/**
 * The SiviBuilder class is responsible for building a Sivi (Simple HTTP Proxy) using the given configuration.
 * It takes a SiviConfig object and a boolean indicating whether it is an HTTPS proxy.
 * It returns a Sivi object that can be used to make a request to the proxy.
 */
export default class SiviBuilder {

    /**
     * Builds a Sivi (Simple HTTP Proxy) using the given configuration.
     * It takes a SiviConfig object and a boolean indicating whether it is an HTTPS proxy.
     * It returns a Sivi object that can be used to make a request to the proxy.
     * @param config - The configuration object for the Sivi.
     * @param isHttps - A boolean indicating whether the Sivi is an HTTPS proxy.
     * @returns A Sivi object that can be used to make a request to the proxy.
     */
    public static build(config: SiviConfig, isHttps: boolean) {
        const { sivi_config, res } = config
        const protocol = isHttps ? https : http
        return protocol.request(sivi_config, (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
            proxyRes.pipe(res, {
                end: true // Auto close stream connection
            });
        })
    }
}