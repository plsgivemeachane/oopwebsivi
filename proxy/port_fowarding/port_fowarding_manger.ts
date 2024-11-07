import { logger } from "../../utils/winston";
import AbstractPortFoward from "./AbstractPortFoward";

export default class PortFowardingManager {
    private static instance: PortFowardingManager;
    private portFowardings: AbstractPortFoward[] = [];

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new PortFowardingManager();
        }
        return this.instance;
    }

    public addPortFowarding(portFowarding: AbstractPortFoward) {
        logger.info(`[Port Fowarding Manager] ${portFowarding.getName()} : ${portFowarding.getIncomingPort()} --> ${portFowarding.getInternalHost()}:${portFowarding.getInternalPort()}`)
        this.portFowardings.push(portFowarding)
    }

    public start() {
        this.portFowardings.forEach(portFowarding => {
            portFowarding.start()
        })
    }

    public stop() {
        this.portFowardings.forEach(portFowarding => {
            portFowarding.stop()
        })
    }
}