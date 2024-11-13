import { logger } from "../../utils/winston";
import dgram from 'dgram'
import AbstractPortForward from "./AbstractPortForward";

export default class UDPForward extends AbstractPortForward {

    private server: dgram.Socket | undefined;

    constructor(incomingPort: number, internalPort: number, internalHost: string, name: string = "UDPFoward") {
        super(incomingPort, internalPort, internalHost, name)
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

    async stop() {
        return new Promise<void>((resolve, reject) => {
            if (!this.server) {
                throw new Error(`[${this.name}] UDP Server not setup yet`)
            }

            this.server.close(() => {
                logger.info(`[${this.name}] UDP port forwarding stopped.`);
                resolve();
            });
        })
    }
}