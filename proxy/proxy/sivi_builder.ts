import { HttpProxyConfig } from "./http_proxy";
import express from 'express'
import http from 'http'
import https from 'https'
import { PassThrough } from "stream";

export interface SiviConfig {
    sivi_config: HttpProxyConfig | null
    res: express.Response | null
    
}

/**
 * The SiviBuilder class is responsible for building a Sivi (Simple HTTP Proxy) using the given configuration.
 * It takes a SiviConfig object and a boolean indicating whether it is an HTTPS proxy.
 * It returns a Sivi object that can be used to make a request to the proxy.
 */
export default class SiviBuilder {

    private config: SiviConfig = {sivi_config: null, res: null};
    private isHttps: boolean = false;

    constructor() {}

    /**
     * Builds a Sivi (Simple HTTP Proxy) using the given configuration.
     * It takes a SiviConfig object and a boolean indicating whether it is an HTTPS proxy.
     * It returns a Sivi object that can be used to make a request to the proxy.
     * @returns A Sivi object that can be used to make a request to the proxy.
     */
    public build() {
        if(!this.config.sivi_config) {
            throw new Error("Sivi config not set")
        }
        if(!this.config.res) {
            throw new Error("Response not set")
        }
        const { sivi_config, res } = this.config
        console.log(sivi_config)
        const protocol = this.isHttps ? https : http
        return protocol.request(sivi_config, (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
            // // Create a PassThrough stream to inspect data in the middle
            // const middleStream = new PassThrough();

            // // Listen to data on the middle stream to log it
            // middleStream.on('data', (chunk) => {
            //     console.log("Chunk data:", chunk.toString()); // Log each chunk as it passes through
            // });

            // Pipe the proxy response to the middle stream, then pipe the middle stream to the final response
            proxyRes
                // .pipe(middleStream)
                .pipe(res, {
                end: true
            });
        })
    }

    public sivi_config(config: HttpProxyConfig) {
        this.config.sivi_config = config
        return this
    }

    public res(res: express.Response) {
        this.config.res = res
        return this
    }
    

    public https() {
        this.isHttps = true
        return this
    }
}