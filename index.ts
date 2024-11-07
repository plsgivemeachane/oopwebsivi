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
import DatabaseInput from "./utils/databaseInput";
import UDPFoward from "./proxy/port_fowarding/UDPFoward";
import ReverseProxyBuilder from "./proxy/reverse_proxy/reverse_proxy_builder";
import APIServer from "./api/api_server";
import Route from "./api/Route";
import DNSServer, { DNS_RECORD } from "./dns/DNSServer";

async function production_main() {
    logger.info("-----------> Getting Port Forwarding")
    const port_forwardings = await DatabaseInput.getPortFowarding()
    logger.info(`[Port Forwarding] setting up ${port_forwardings.length}`)
    port_forwardings.forEach(port_forwarding => {
        // console.dir(port_forwarding)
        switch(port_forwarding.protocol) {
            case "tcp":
                const tcp_forward = new TCPFoward(
                        port_forwarding.incoming_port, 
                        port_forwarding.internal_port, 
                        port_forwarding.internal_host, 
                        `TCPFoward ${port_forwarding.id}`
                    )
                    .setup()
                PortFowardingManager.getInstance().addPortFowarding(tcp_forward)
                break;
            case "udp":
                const udp_forward = new UDPFoward(
                    port_forwarding.incoming_port, 
                    port_forwarding.internal_port, 
                    port_forwarding.internal_host,
                    `UDPFoward ${port_forwarding.id}`
                )
                    .setup()
                PortFowardingManager.getInstance().addPortFowarding(udp_forward)
                break;
        }
    })

    logger.info("-----------> Getting Reserve Hosts")
    const reserve_hosts = await DatabaseInput.getReserveHosts()
    logger.info(`[Reserve Hosts] setting up ${reserve_hosts.length}`)
    reserve_hosts.forEach(reserve_host => {
        const builder = new ReverseProxyBuilder()
        builder.hostname(reserve_host.domain)
        switch (reserve_host.protocol) {
            case "http":
                builder.http_port(parseInt(reserve_host.target_address.split(":")[1]))
                break;
            case "https":
                builder.https_port(parseInt(reserve_host.target_address.split(":")[1]))
                break;
        }
        const reverse_proxy = builder.build()
        reverse_proxy.setup()
        ReverseProxyManager.getInstance().addReverseProxy(reverse_proxy)
    })

    PortFowardingManager.getInstance().start()
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

async function server_main() {
    const server = new APIServer()
    const testRoute = new Route("/test", 'get')
        .route((req, res) => {
            return res.send("Hello World")
        })

    server.addRoute(testRoute)
    server.start()
}

async function dns_main() {
    const server = new DNSServer(5333)
    
    // server.addRecord(record)
    // server.addRecord({
    //     domain: "lilboissivi.com",
    //     type: "A",
    //     name: "lilboissivi.com",
    //     value: "127.0.0.1",
    //     id: 1
    // })

    const domains = await DatabaseInput.getDomainDns()
    domains.forEach(async (domain) => {
        const records = await DatabaseInput.getDomainDnsRecord(domain.id)
        records.forEach((record) => {
            server.addRecord(record as DNS_RECORD)
        });
    })

    server.setup()
    server.start()
}

async function main() {
    // await development_main()
    // await server_main()
    await dns_main()
}

main();