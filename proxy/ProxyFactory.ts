import { logger } from "../utils/winston";
import FirewallFactory from "./firewall/FirewallFactory";
import ReverseProxy from "./reverse_proxy/reverse_proxy";
import ReverseProxyManager from "./reverse_proxy/reverse_proxy_manager";

export default class ProxyFactory {
    private config: any;

    constructor(config: any) {
        this.config = config;
    }

    build() {
        const keys = Object.keys(this.config);
        for (const key of keys) {
            logger.info("-----> " + key)
            const proxy = this.createProxy(key)
            ReverseProxyManager.getInstance().addReverseProxy(proxy)
        }
    
    }

    createProxy(key: string): ReverseProxy {
        const config = this.config[key];
        switch (config.type) {
            case "reverse_proxy":
                const proxy = new ReverseProxy({
                    http_port: config.http_port,
                    https_port: config.https_port,
                    hostname: config.hostname,
                    path: config.path,
                },
                    config.name ?? key
                )

                const pluginsBuilder = new FirewallFactory(proxy, config)
                return pluginsBuilder.build().setup()
                
        }
        throw new Error(`Unsupported proxy type: ${config.type}`);
    }
}