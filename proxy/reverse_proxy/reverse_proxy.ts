import HttpProxy from "../proxy/http_proxy";
import HttpsProxy from "../proxy/https_proxy";

export interface ReverseProxyConfig {
    http_port?: number
    https_port?: number
    hostname?: string
    path?: string
}

/**
 * The ReverseProxy class represents a reverse proxy server.
 * It provides methods to get the HTTP and HTTPS handlers of the reverse proxy.
 * It also provides methods to get the configuration of the reverse proxy.
 * 
 * The ReverseProxy class is responsible for setting up the reverse proxy server.
 * It creates an HTTP and HTTPS server, and sets up the routes for the HTTP and HTTPS servers.
 */
export default class ReverseProxy {
    private readonly http_server: HttpProxy;
    private readonly https_server: HttpsProxy;
    private readonly config: ReverseProxyConfig;

    /**
     * Creates a new ReverseProxy instance.
     * @param {ReverseProxyConfig} config A configuration object containing the following properties:
     *  - http_port: The port number on which the HTTP server will listen. Defaults to 80.
     *  - https_port: The port number on which the HTTPS server will listen. Defaults to 443.
     *  - hostname: The hostname of the reverse proxy server. Defaults to 'localhost'.
     *  - path: The path prefix of the reverse proxy server. Defaults to '/'.
     */
    public constructor(config: ReverseProxyConfig) {
        this.config = config
        this.http_server = new HttpProxy(config.http_port??80, config.hostname??'localhost', config.path??'/')
        this.https_server = new HttpsProxy(config.https_port??443, config.hostname??'localhost', config.path??'/')
        this.http_server.setup()
        this.https_server.setup()
    }

    /**
     * Returns the HTTP handler of this ReverseProxy instance.
     * @returns A function that takes an Express request and response object, logging the request details and executing all routes.
     */
    public getHttpHandler() {
        return this.http_server.getHandler()
    }

    /**
     * Returns the HTTPS handler of this ReverseProxy instance.
     * @returns A function that takes an Express request and response object, logging the request details and executing all routes.
     */
    public  getHttpsHandler() {
        return this.https_server.getHandler()
    }

    /**
     * Returns the configuration object of this ReverseProxy instance.
     * @returns The configuration object.
     */
    public getConfig() {
        return this.config
    }
}