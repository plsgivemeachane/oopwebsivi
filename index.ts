import ReverseProxyManager from "./proxy/reverse_proxy/reverse_proxy_manager";
import ReverseProxy from "./proxy/reverse_proxy/reverse_proxy";
import AlwaysBlockRule from "./proxy/firewall/rules/AlwaysBlockRule";
import FirewallRule from "./proxy/firewall/FirewallRule";
import LoggingRules from "./proxy/firewall/rules/LoggingRules";
import YAMLReader from "./utils/YAMLReader";
import { logger } from "./utils/winston";
import ProxyFactory from "./proxy/ProxyFactory";
import TCPFoward from "./proxy/port_fowarding/TCPFoward";
import PortFowardingManager from "./proxy/port_fowarding/port_fowarding_manger";

async function main() {
    // const yamlReader = new YAMLReader("config.yaml");
    // const config = await yamlReader.readConfig() as any;
    
    // // Reverse Proxy

    // logger.info("-----------> Reverse Proxy Setting up")

    // const proxy_factory = new ProxyFactory(config)
    // proxy_factory.build()

    // logger.info("-----------> Reverse Proxy Starting")
    // ReverseProxyManager.getInstance().start()

    logger.info("-----------> Port Forwarding Setting up")
    const tcp_forward = new TCPFoward(8080, 2710, "localhost").setup()
    PortFowardingManager.getInstance().addPortFowarding(tcp_forward)

    logger.info("-----------> Port Forwarding Starting")
    PortFowardingManager.getInstance().start()
}

main();