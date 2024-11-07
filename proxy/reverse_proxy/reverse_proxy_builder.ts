import ReverseProxy, { ReverseProxyConfig } from "./reverse_proxy";

export default class ReverseProxyBuilder {
    private config: ReverseProxyConfig = {
        http_port: 80,
        https_port: 443,
        hostname: "localhost",
        path: "/",
    }; // Default setting
    
    constructor() {}

    public http_port(port: number) {
        this.config.http_port = port;
        return this;
    }

    public https_port(port: number) {
        this.config.https_port = port;
        return this;
    }

    public hostname(hostname: string) {
        this.config.hostname = hostname;
        return this;
    }

    public path(path: string) {
        this.config.path = path;
        return this;
    }    

    public build(name: string = "ReverseProxy") {
        return new ReverseProxy(this.config, name);
    }
}