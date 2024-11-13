import net from 'net'
import { logger } from '../../utils/winston';
import AbstractPortForward from './AbstractPortForward';

export default class TCPForward extends AbstractPortForward {
    private server: net.Server | undefined;

    constructor(incomingPort: number, internalPort: number, internalHost: string, name: string = "TCPFoward") {
        super(incomingPort, internalPort, internalHost, name)
    }

    setup() {
        this.server = net.createServer((csocket) => {
            const ssocket = new net.Socket();

            ssocket.connect(this.internalPort, this.internalHost, () => {
                csocket.pipe(ssocket);
                ssocket.pipe(csocket);
            });

            csocket.on('error', (err) => {
                logger.error(`[${this.name}] Client socket error: ${err.message}`);
                ssocket.destroy();
            });

            ssocket.on('error', (err) => {
                logger.error(`[${this.name}] Server socket error: ${err.message}`);
                csocket.destroy();
            });
        })

        this.server.on("connection", (socket) => {
            logger.info(`[${this.name}] Forward connection: ${socket.remoteAddress}:${this.incomingPort} ---> ${this.internalHost}:${this.internalPort}`);
        });

        this.server.on('error', (err) => {
            logger.error(`[${this.name}] Server error: ${err.message}`);
        });
        
        return this
    }

    public start() {
        if(!this.server) {
            throw new Error(`[${this.name}] TCP Server not setup yet`)
        }

        this.server.listen(this.incomingPort, () => {
            logger.info(`[${this.name}] TCP port forwarding listening on port ${this.incomingPort}...`);
        });
    }

    public async stop() {
        return new Promise<void>((resolve, reject) => {
            if (!this.server) {
                throw new Error(`[${this.name}] TCP Server not setup yet`);
            }

            this.server.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    logger.info(`[${this.name}] TCP port forwarding stopped.`);
                    resolve();
                }
            });
        });
    }
}