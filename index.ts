import ReverseProxyManager from "./proxy/reverse_proxy/reverse_proxy_manager";
import YAMLReader from "./utils/YAMLReader";
import { logger } from "./utils/winston";
import ProxyFactory from "./proxy/ProxyFactory";
import TCPForward from "./proxy/port_fowarding/TCPForward";
import PortForwardingManager from "./proxy/port_fowarding/port_forwarding_manger";
import DatabaseManager from "./utils/databaseManager";
import UDPFroward from "./proxy/port_fowarding/UDPForward";
import ReverseProxyBuilder from "./proxy/reverse_proxy/reverse_proxy_builder";
import RESTApi from "./api/api_server";
import DNSServer, { DNS_RECORD } from "./dns/DNSServer";
import hello from "./api/routes/hello";
import login from "./api/routes/login";
import RouteGroup from "./api/RouteGroup";
import dns from "./api/routes/v1/dns";
import port_fowarding from "./api/routes/v1/port_fowarding";
import logs from "./api/routes/v1/logs";
import Route from "./api/Route";



/**
 * Sets up and starts port forwarding and reverse proxy configurations
 * by fetching data from the database and initializing the appropriate
 * instances based on the retrieved configurations for TCP, UDP, HTTP, and HTTPS
 * protocols.
 *
 * @return {Promise<void>} A promise that resolves when the setup and start
 * process of port forwarding and reverse proxy configurations is complete.
 */
async function production_main() {
    logger.info("[MASTER] -----------> Getting Port Forwarding")
    const port_forwarding = await DatabaseManager.getPortForwarding()
    logger.info(`[Port Forwarding] setting up ${port_forwarding.length}`)
    port_forwarding.forEach(port_forwarding => {
        // console.dir(port_forwarding)
        switch(port_forwarding.protocol) {
            case "tcp":
                const tcp_forward = new TCPForward(
                        port_forwarding.incoming_port, 
                        port_forwarding.internal_port, 
                        port_forwarding.internal_host, 
                        `TCPForward ${port_forwarding.id}`
                    )
                    .setup()
                PortForwardingManager.getInstance().addPortForwarding(tcp_forward)
                break;
            case "udp":
                const udp_forward = new UDPFroward(
                    port_forwarding.incoming_port, 
                    port_forwarding.internal_port, 
                    port_forwarding.internal_host,
                    `UDPForward ${port_forwarding.id}`
                )
                    .setup()
                PortForwardingManager.getInstance().addPortForwarding(udp_forward)
                break;
        }
    })

    logger.info("[MASTER] -----------> Getting Reserve Hosts")
    const reverse_host = await DatabaseManager.getReserveHosts()
    logger.info(`[Reserve Hosts] setting up ${reverse_host.length}`)
    reverse_host.forEach(reverse_host => {
        ReverseProxyManager.getInstance().addReverseProxyFromData(reverse_host)
    })

    PortForwardingManager.getInstance().start()
    ReverseProxyManager.getInstance().start()
}

async function development_main() {
    // ------------------------------

    const yamlReader = new YAMLReader("./config.yaml")
    const config = await yamlReader.readConfig()
    const proxyFactory = new ProxyFactory(config)
    proxyFactory.build()

    ReverseProxyManager.getInstance().start()
}

function server_main() {
    const server = new RESTApi()
    server.addRoute(hello)
    server.addRoute(
        new RouteGroup("/api")
            .route(new RouteGroup("/v1")
                .route(dns, port_fowarding)
            )
            .route(login)
    )
    server.addRoute(logs)
    server.start()
}

/**
 * Main function to initialize and start the DNS server.
 *
 * This function sets up the DNS server on port 5333 and adds
 * DNS records retrieved from a database. It iterates through
 * the domains and their associated DNS records, adding each
 * record to the DNS server before starting it.
 *
 * @return {Promise<void>} A promise that resolves when the DNS server has been set up and started.
 */
async function dns_main(): Promise<void> {
    const server = new DNSServer(5333)
    logger.info("[MASTER] Setting up domains")
    const domains = await DatabaseManager.getDomainDns()
    for (const domain of domains) {
        const records = await DatabaseManager.getDomainDnsRecord(domain.id)
        records.forEach((record) => {
            server.addRecord(record as DNS_RECORD)
        });
    }

    server.setup()
    server.start()
}

async function main(): Promise<void> {
    await production_main() // Reverse proxy and Port forwarding
    await dns_main() // DNS
    server_main() // API
}

main().then(_ => {
    logger.info("[MASTER] Server run successfully")
});