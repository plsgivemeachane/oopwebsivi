import ReverseProxyManager from "./proxy/reverse_proxy/reverse_proxy_manager";
import { logger } from "./utils/winston";
import PortForwardingManager from "./proxy/port_fowarding/port_forwarding_manger";
import RESTApi from "./api/api_server";
import DNSServer from "./dns/DNSServer";
import hello from "./api/routes/hello";
import login from "./api/routes/login";
import RouteGroup from "./api/RouteGroup";
import dns from "./api/routes/v1/dns";
import port_forwarding from "./api/routes/v1/port_forwarding";
import logs from "./api/routes/v1/logs";
import reverse_proxy from "./api/routes/v1/reverse_proxy";
import app_route from "./api/routes/app_route";
import dotenv from 'dotenv'
dotenv.config()

/**
 * Sets up and starts port forwarding and reverse proxy configurations
 * by fetching data from the database and initializing the appropriate
 * instances based on the retrieved configurations for TCP, UDP, HTTP, and HTTPS
 * protocols.
 *
 * @return {Promise<void>} A promise that resolves when the setup and start
 * process of port forwarding and reverse proxy configurations is complete.
 */
async function production_main(): Promise<void> {
    await PortForwardingManager.getInstance().start()
    await ReverseProxyManager.getInstance().start()
}


function server_main() {
    const server = new RESTApi()
    server.addRoute(hello)
    server.addRoute(app_route)
    server.addRoute(
        new RouteGroup("/api")
            .route(dns, port_forwarding, reverse_proxy)
        
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
    return DNSServer.getInstance().fetchAndStart()
}

async function main(): Promise<void> {
    await production_main() // Reverse proxy and Port forwarding
    await dns_main() // DNS
    server_main() // API

    // Code chạy next app
    const { exec } = require('child_process');
    const startUiNextJs = `npx next start ui -p ${process.env.WEB_UI_PORT}`;
    console.log(`Web UI is listening in port ${process.env.WEB_UI_PORT}`)
    exec(startUiNextJs, (err: any, stdout: any, stderr: any) => {
        if (err) {
            console.error(`Error starting Next.js app: ${err}`);
            return;
        }
        console.log(`Next.js app output: ${stdout}`);
        console.error(`Next.js app error: ${stderr}`);
    });
}

main().then(_ => {
    logger.verbose("[MASTER] Server started successfully")
});