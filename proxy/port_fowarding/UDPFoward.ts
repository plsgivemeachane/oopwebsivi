import { logger } from "../../utils/winston";
import dgram from 'dgram'
import AbstractPortFoward from "./AbstractPortFoward";

export default class UDPFoward implements AbstractPortFoward {
    private readonly incomingPort: number;
    private readonly internalPort: number;
    private readonly internalHost: string;
    private readonly name: string;

    private server: dgram.Socket | undefined;

    constructor(incomingPort: number, internalPort: number, internalHost: string, name: string = "UDPFoward") {
        this.incomingPort = incomingPort;
        this.internalPort = internalPort;
        this.internalHost = internalHost;
        this.name = name
    }

    setup() {
        this.server = dgram.createSocket('udp4');

        this.server.on('message', (msg, rinfo) => {
            const socket = dgram.createSocket('udp4');
            socket.send(msg, 0, msg.length, this.internalPort, this.internalHost, err => {
                if (err) {
                    logger.error(`[${this.name}] Error sending UDP message: ${err.message}`);
                    socket.close();
                }
            });

            socket.on('message', (msg) => {
                this.server?.send(msg, 0, msg.length, rinfo.port, rinfo.address, err => {
                    if(err) {
                        logger.error(`[${this.name}] Error sending UDP message: ${err.message}`);
                    }
                });
            });

            socket.on('error', (err) => {
                logger.error(`[${this.name}] Error sending UDP message: ${err.message}`);
            });
        });

        this.server.on('error', (err) => {
            logger.error(`[${this.name}] Server error: ${err.message}`);
        });
        
        return this
    }

    start() {
        if(!this.server) {
            throw new Error(`[${this.name}] UDP Server not setup yet`)
        }

        this.server.bind(this.incomingPort, () => {
            logger.info(`[${this.name}] UDP port forwarding listening on port ${this.incomingPort}...`);
        });
    }

    stop() {
        if(!this.server) {
            throw new Error(`[${this.name}] UDP Server not setup yet`)
        }

        this.server.close(() => {
            logger.info(`[${this.name}] UDP port forwarding stopped.`);
        });
    }
}