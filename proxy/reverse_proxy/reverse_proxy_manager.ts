import { logger } from "../../utils/winston";
import ReverseProxy from "./reverse_proxy";
import express from 'express'
import http from 'http'
import ReverseProxyBuilder from "./reverse_proxy_builder";
import DatabaseManager from "../../utils/databaseManager";
import URLUtils from "../../utils/URLUtils";

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

    public async fetchReverseProxy() {
        logger.verbose("[Reverse Proxy Manager] -----------> Getting Reserve Hosts")
        const reverse_host = await DatabaseManager.getReserveHosts()
        logger.verbose(`[Reverse Proxy Manager] setting up ${reverse_host.length}`)
        reverse_host.forEach(reverse_host => {
            // console.log(reverse_host)
            this.addReverseProxyFromData(reverse_host)
        })
    }

    /**
     * Adds a reverse proxy to the manager.
     * 
     * If a reverse proxy with the same hostname already exists, an error is thrown.
     * 
     * @param reverse_proxy - The reverse proxy to add.
     */
    public addReverseProxy(reverse_proxy: ReverseProxy, alias: string) {
        if(!reverse_proxy.setted_up) {
            logger.error(`Reverse proxy has not been set up to the endpoint! --- ${reverse_proxy.name}`)
        }
        if (this.proxy_map.has(alias)) {
            throw new Error(`Reverse proxy with hostname ${reverse_proxy.getConfig().hostname} already exists!`);
        }

        // Add reverse proxy to map
        this.proxy_map.set(alias, reverse_proxy);
        logger.verbose(`[Reverse Proxy Manager] Reverse proxy added: ${reverse_proxy.getConfig().hostname}`);
    }

    public stop() {
        return new Promise<void>((resolve, reject) => {
            // clear out the data
            this.proxy_map.clear()

            this.http_server.close(() => {
                logger.info(`[Reverse Server Manager] HTTP reverse proxy closed`);
                resolve()
            });
            // this.https_server.close(() => {
            //     logger.info(`[Reverse Server Manager] HTTPS reverse proxy closed`);
            // });
        })
    }

    /**
     * Starts the ReverseProxyManager and sets up the HTTP and HTTPS servers.
     * 
     * The HTTP server listens on port 80 and forwards requests to the corresponding reverse proxy based on the hostname in the request.
     * The HTTPS server listens on port 443 and forwards requests to the corresponding reverse proxy based on the hostname in the request.
     */
    public async start() {
        // Fetch
        await ReverseProxyManager.getInstance().fetchReverseProxy()


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
                logger.info(`[${reverse_proxy.name}] Request handled for ${hostname}`)
                console.log(reverse_proxy.getConfig())
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
        const data = URLUtils.extractURL(reverse_host.target_address)
        builder.hostname(data.hostname)
        switch (reverse_host.protocol) {
            case "http":
                builder.http_port(data.port)
                break;
            case "https":
                builder.https_port(data.port)
                break;
        }

        const reverse_proxy = builder.build().setup()
        this.addReverseProxy(reverse_proxy, reverse_host.domain)
    }

    public removeReverseProxyByName(reverse_host: string) {
        logger.info(`[Reverse Proxy Manager] Removing reverse proxy: ${reverse_host}`)
        this.proxy_map.delete(reverse_host)
    }
}