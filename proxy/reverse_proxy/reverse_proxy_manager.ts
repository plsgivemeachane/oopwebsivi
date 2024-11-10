import { logger } from "../../utils/winston";
import ReverseProxy from "./reverse_proxy";
import express from 'express'
import http from 'http'
import ReverseProxyBuilder from "./reverse_proxy_builder";

/**
 * The ReverseProxyManager is responsible for managing reverse proxies.
 * It provides methods to add, remove, and start reverse proxies.
 * It also provides methods to get the HTTP and HTTPS handlers of the reverse proxies.
 */
export default class ReverseProxyManager {
    private proxy_map: Map<string, ReverseProxy>;
    private static instance: ReverseProxyManager;
    private http_app = express();
    private https_app = express();
    private http_server = http.createServer()
    private https_server = http.createServer()


    private constructor() {
        this.proxy_map = new Map<string, ReverseProxy>();
    }

    /**
     * Returns the singleton instance of the ReverseProxyManager.
     * 
     * @returns The singleton instance.
     */
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ReverseProxyManager();
        }
        return this.instance;
    }

    /**
     * Adds a reverse proxy to the manager.
     * 
     * If a reverse proxy with the same hostname already exists, an error is thrown.
     * 
     * @param reverse_proxy - The reverse proxy to add.
     */
    public addReverseProxy(reverse_proxy: ReverseProxy) {
        if(!reverse_proxy.setted_up) {
            logger.error(`Reverse proxy has not been set up to the endpoint! --- ${reverse_proxy.name}`)
        }
        if (this.proxy_map.has(reverse_proxy.getConfig().hostname??"localhost")) {
            throw new Error(`Reverse proxy with hostname ${reverse_proxy.getConfig().hostname} already exists!`);
        }

        // Add reverse proxy to map
        this.proxy_map.set(reverse_proxy.getConfig().hostname??"localhost", reverse_proxy);
        logger.verbose(`[Reverse Proxy Manager] Reverse proxy added: ${reverse_proxy.getConfig().hostname}`);
    }

    public stop() {
        this.http_server.close(() => {
            logger.info(`[Reverse Server Manager] HTTP reverse proxy closed`);
        });
        // this.https_server.close(() => {
        //     logger.info(`[Reverse Server Manager] HTTPS reverse proxy closed`);
        // });
    }

    /**
     * Starts the ReverseProxyManager and sets up the HTTP and HTTPS servers.
     * 
     * The HTTP server listens on port 80 and forwards requests to the corresponding reverse proxy based on the hostname in the request.
     * The HTTPS server listens on port 443 and forwards requests to the corresponding reverse proxy based on the hostname in the request.
     */
    public start() {
        this.http_app = express();
        this.https_app = express();

        this.http_app.use((req, res) => {
            const hostname = req.headers.host;
            if(!hostname) {
                res.writeHead(400);
                res.end('Missing host header');
                return;
            }
            
            if (this.proxy_map.has(hostname)) {
                const reverse_proxy = this.proxy_map.get(hostname) as ReverseProxy; // Already check null
                // logger.info(`[${reverse_proxy.name}] Forwarding request to ${hostname}`)
                reverse_proxy.getHttpHandler()(req, res);
            } else {
                res.writeHead(404);
                res.end('This domain is not configured yet');
            }
        })

        this.https_app.use((req, res) => {
            const hostname = req.headers.host;
            if(!hostname) {
                res.writeHead(400);
                res.end('Missing host header');
                return;
            }
            
            if (this.proxy_map.has(hostname)) {
                const reverse_proxy = this.proxy_map.get(hostname) as ReverseProxy; // Already check null
                reverse_proxy.getHttpsHandler()(req, res);
            } else {
                res.writeHead(404);
                res.end('This domain is not configured yet');
            }
        })

        this.http_server = http.createServer(this.http_app);
        // const https_server = https.createServer({
        //     key: fs.readFileSync('ssl/server.key'),
        //     cert: fs.readFileSync('ssl/server.crt')
        // }, https_app);

        this.http_server.listen(80, () => {
            logger.info(`[Reverse Server Manager] HTTP reverse proxy listening on port 80...`);
        });

        // https_server.listen(443, () => {
        //     logger.info(`HTTPS proxy listening on port 443...`);
        // });
    }

    public addReverseProxyFromData(reverse_host: any) {
        const builder = new ReverseProxyBuilder()
        builder.hostname(reverse_host.domain)
        switch (reverse_host.protocol) {
            case "http":
                builder.http_port(parseInt(reverse_host.target_address.split(":")[1]))
                break;
            case "https":
                builder.https_port(parseInt(reverse_host.target_address.split(":")[1]))
                break;
        }

        const reverse_proxy = builder.build().setup()
        this.addReverseProxy(reverse_proxy)
    }

    public removeReverseProxyByName(reverse_host: string) {
        logger.info(`[Reverse Proxy Manager] Removing reverse proxy: ${reverse_host}`)
        this.proxy_map.delete(reverse_host)
    }
}