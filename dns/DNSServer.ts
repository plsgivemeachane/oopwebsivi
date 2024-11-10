import { Packet, UDPServer } from "dns2";
import dgram from "dgram";
import { logger } from "../utils/winston";
import DNSResolver from "./DNSResolver";
import dotenv from "dotenv";
import DatabaseManager from "../utils/databaseManager";
dotenv.config();

export interface DNS_RECORD {
    domain?: {
        id: string;
        domain: string;
    };
    id?: string;
    domain_id: string;
    name: string;
    type: string;
    value: string;
    create_at?: string;
}

export interface DNS_QUESTION {
    name: string;
    type: number;
}

export default class DNSServer {
    private static instance: DNSServer;

    private readonly port: number;
    private server: dgram.Socket;
    private readonly records: Map<string, DNS_RECORD>;
    private constructor() {
        this.port = process.env.DNS_SERVER_PORT ? parseInt(process.env.DNS_SERVER_PORT) : 53;
        this.records = new Map<string, DNS_RECORD>();
        this.server = new UDPServer({
            type: "udp4",
        });
    }

    public static getInstance() {
        if (!DNSServer.instance) {
            DNSServer.instance = new DNSServer();
        }
        return DNSServer.instance;
    }

    public async fetchAndStart() {
        logger.verbose("[DNSServer] Setting up domains")
        const domains = await DatabaseManager.getDomainDns()
        for (const domain of domains) {
            const records = await DatabaseManager.getDomainDnsRecord(domain.id)
            records.forEach((record) => {
                this.addRecord(record as DNS_RECORD)
            });
        }

        this.setup()
        this.start()
    }

    /**
     * Set up the DNS server to listen for requests.
     * 
     * When a request is received, the server will loop through each question
     * and attempt to find a matching DNS record in the `records` Map.
     * If a matching record is found, the server will construct an appropriate
     * response based on the type of record requested and the type of record
     * found in the Map.
     */
    public setup() {
        this.server.on("request", async (request, send) => {
            const { questions } = request;
            const question = questions[0];

            logger.verbose(`Received DNS request: ${JSON.stringify(request)}`);

            // If the question is not a DNS query, forward the request to the
            // "unconfigured domain" route on the API server (localhost:3000)
            const record = this.records.get(question.name.toLowerCase());
            if (record) {
                const dnsResolver = new DNSResolver(request);
                await dnsResolver.process(record, question);
                const response = dnsResolver.getResponse();
                send(response);
                return;
            }

            send(Packet.createResponseFromRequest(request)); // Fallback
        });
    }

    public addRecord(record: DNS_RECORD) {
        logger.info(`[DNS Server] Adding Record ${record.name}`)
        this.records.set(record.name.toLowerCase(), record);
    }

    public getRecords() {
        return this.records;
    }

    public start() {
        this.server.on("listening", () => {
            logger.info(`[DNS Server] DNS server listening on port ${this.port}`);
        });

        this.server.bind(this.port);
    }
    
    public stop() {
        return new Promise<void>((resolve, reject) => {
            // Remove the data of records
            this.records.clear();

            this.server.close(() => {
                logger.info("[DNS Server] DNS server has been stopped.");
                resolve()
            });
        })
    }
}
