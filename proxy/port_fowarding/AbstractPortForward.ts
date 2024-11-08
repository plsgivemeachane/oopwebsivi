export default abstract class AbstractPortForward {

    protected readonly name: string = "AbstractPortForward";
    protected readonly incomingPort: number;
    protected readonly internalPort: number;
    protected readonly internalHost: string;

    constructor(incomingPort: number, internalPort: number, internalHost: string, name: string = "TCPFoward") {
        this.incomingPort = incomingPort;
        this.internalPort = internalPort;
        this.internalHost = internalHost;
        this.name = name
    }

    public getName() {
        return this.name
    }

    public getIncomingPort() {
        return this.incomingPort
    }

    public getInternalPort() {
        return this.internalPort
    }

    public getInternalHost() {
        return this.internalHost
    }

    abstract setup(): any
    abstract start(): void
    abstract stop(): Promise<void>
}