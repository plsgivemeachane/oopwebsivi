import { logger } from "../../utils/winston";
import AbstractPortForward from "./AbstractPortForward";
import Utils from "../../utils/Utils";

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

    public addPortForwarding(portForwarding: AbstractPortForward) {
        logger.verbose(`[Port Forwarding Manager] ${portForwarding.getName()} : ${portForwarding.getIncomingPort()} --> ${portForwarding.getInternalHost()}:${portForwarding.getInternalPort()}`)
        this.portForwarding.push(portForwarding)
    }

    public start() {
        logger.info(`[Port Forwarding Manager] Starting port forwarding...`)
        this.portForwarding.forEach(portForwarding => {
            portForwarding.start()
        })
    }

    public async stop() {
        logger.info(`[Port Forwarding Manager] Stopping port forwarding...`)
        for (const portForwarding of this.portForwarding) {
            await portForwarding.stop();
        }
    }

    public restart() {
        Utils.defer(async () => {
            // Restart the ports server
            await this.stop()
            this.start()
        }, 200) // Queue update for 200ms
    }
}