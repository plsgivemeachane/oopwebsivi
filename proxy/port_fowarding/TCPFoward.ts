import net from 'net'
import { logger } from '../../utils/winston';

export default class TCPFoward {
    private readonly incomingPort: number;
    private readonly internalPort: number;
    private readonly internalHost: string;
    private readonly name: string;

    private server: net.Server | undefined;

    constructor(incomingPort: number, internalPort: number, internalHost: string, name: string = "TCPFoward") {
        this.incomingPort = incomingPort;
        this.internalPort = internalPort;
        this.internalHost = internalHost;
        this.name = name
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
            });

            ssocket.on('error', (err) => {
                logger.error(`[${this.name}] Server socket error: ${err.message}`);
                csocket.destroy();
            });
        })

        this.server.on("connection", (socket) => {
            logger.info(`[${this.name}] Foward connection: ${socket.remoteAddress}:${this.incomingPort} through ${socket.remotePort} ---> ${this.internalHost}:${this.internalPort}`);
        });

        this.server.on('error', (err) => {
            logger.error(`[${this.name}] Server error: ${err.message}`);
        });
        
        return this
    }

    start() {
        if(!this.server) {
            throw new Error(`[${this.name}] TCP Server not setup yet`)
        }

        this.server.listen(this.incomingPort, () => {
            logger.info(`[${this.name}] TCP port forwarding listening on port ${this.incomingPort}...`);
        });
    }

    stop() {
        if(!this.server) {
            throw new Error(`[${this.name}] TCP Server not setup yet`)
        }

        this.server.close(() => {
            logger.info(`[${this.name}] TCP port forwarding stopped.`);
        });
    }
}