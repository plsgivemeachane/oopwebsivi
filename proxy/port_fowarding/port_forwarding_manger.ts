import { logger } from "../../utils/winston";
import AbstractPortForward from "./AbstractPortForward";
import Utils from "../../utils/Utils";
import TCPForward from "./TCPForward";
import UDPFroward from "./UDPForward";
import DatabaseManager from "../../utils/databaseManager";

export default class PortForwardingManager {
    private static instance: PortForwardingManager;
    private portForwarding: AbstractPortForward[] = [];

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new PortForwardingManager();
        }
        return this.instance;
    }

    public async fetchPortForwarding() {
        logger.verbose("[Port Forwarding Manager] -----------> Getting Port Forwarding")
        const port_forwarding = await DatabaseManager.getPortForwarding()
        logger.verbose(`[Port Forwarding Manager] setting up ${port_forwarding.length}`)
        port_forwarding.forEach(port_forwarding => {
            this.addPortForwardingFromData(port_forwarding)
        })
    }

    public addPortForwarding(portForwarding: AbstractPortForward) {
        logger.verbose(`[Port Forwarding Manager] ${portForwarding.getName()} : ${portForwarding.getIncomingPort()} --> ${portForwarding.getInternalHost()}:${portForwarding.getInternalPort()}`)
        this.portForwarding.push(portForwarding)
    }

    public removePortForwarding(portForwardingId: string) {
        this.portForwarding
            .filter(o => o.getName().startsWith(portForwardingId))
            .forEach(o => o.stop()) // Stop the server with id
        // Remove the server
        this.portForwarding = this.portForwarding.filter(o => !o.getName().startsWith(portForwardingId))
    }

    public addPortForwardingFromData(port_forwarding: any) {
        switch(port_forwarding.protocol) {
            case "tcp":
                const tcp_forward = new TCPForward(
                    port_forwarding.incoming_port,
                    port_forwarding.internal_port,
                    port_forwarding.internal_host,
                    `${port_forwarding.id}-TCP`
                )
                    .setup()
                this.addPortForwarding(tcp_forward)
                break;
            case "udp":
                const udp_forward = new UDPFroward(
                    port_forwarding.incoming_port,
                    port_forwarding.internal_port,
                    port_forwarding.internal_host,
                    `${port_forwarding.id}-UDP`
                )
                    .setup()
                this.addPortForwarding(udp_forward)
                break;
        }
    }

    public async start() {
        await this.fetchPortForwarding()
        logger.info(`[Port Forwarding Manager] Starting port forwarding...`)
        this.portForwarding.forEach(portForwarding => {
            portForwarding.start()
        })
    }

    public async stop() {
        logger.info(`[Port Forwarding Manager] Stopping port forwarding...`)
        // Remove data
        this.portForwarding = []
        for (const portForwarding of this.portForwarding) {
            await portForwarding.stop();
        }
    }

    public restart() {
        Utils.defer(async () => {
            // Restart the ports server
            await this.stop()
            await this.start()
        }, 200) // Queue update for 200ms
    }
}