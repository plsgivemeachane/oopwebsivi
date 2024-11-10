import { Packet, DnsResponse } from "dns2";
import dns from "dns";
import { DNS_QUESTION, DNS_RECORD } from "./DNSServer";
import { logger } from "../utils/winston";
const recordTypeMap : {
    [key: number]: string
} = {
    [Packet.TYPE.A]: "A",
    [Packet.TYPE.AAAA]: "AAAA",
    [Packet.TYPE.CNAME]: "CNAME",
    [Packet.TYPE.ANY]: "ANY",
    [Packet.TYPE.AXFR]: "AXFR",
    [Packet.TYPE.CAA]: "CAA",
    [Packet.TYPE.EDNS]: "EDNS",
    [Packet.TYPE.HINFO]: "HINFO",
    [Packet.TYPE.MAILA]: "MAILA",
    [Packet.TYPE.MAILB]: "MAILB",
    [Packet.TYPE.MB]: "MB",
    [Packet.TYPE.MD]: "MD",
    [Packet.TYPE.MF]: "MF",
    [Packet.TYPE.MG]: "MG",
    [Packet.TYPE.MINFO]: "MINFO",
    [Packet.TYPE.MR]: "MR",
    [Packet.TYPE.MX]: "MX",
    [Packet.TYPE.NS]: "NS",
    [Packet.TYPE.NULL]: "NULL",
    [Packet.TYPE.PTR]: "PTR",
    [Packet.TYPE.SOA]: "SOA",
    [Packet.TYPE.SPF]: "SPF",
    [Packet.TYPE.SRV]: "SRV",
    [Packet.TYPE.TXT]: "TXT",
    [Packet.TYPE.WKS]: "WKS",
};

interface ANSWER {
    name: string;
    type: number;
    class: number;
    ttl: number;
    address: string;
}

class DNSAnswerBuilder {
    private readonly answers: ANSWER;

    constructor() {
        this.answers = {
            name: "",
            type: 0,
            class: 0,
            ttl: 0,
            address: "",
        };

        return this
    }

    public name(name: string) {
        this.answers.name = name;
        return this;
    }

    public type(type: number) {
        this.answers.type = type;
        return this;
    }

    public class_(class_: number) {
        this.answers.class = class_;
        return this;
    }

    public ttl(ttl: number) {
        this.answers.ttl = ttl;
        return this;
    }

    public address(address: string) {
        this.answers.address = address;
        return this;
    }

    public build() {
        return this.answers;
    }
}

export default class DNSResolver {
    
    private readonly response: DnsResponse;

    constructor(request: any) {
        this.response = Packet.createResponseFromRequest(request);
    }


    private async resolveRecord(record: DNS_RECORD) {
        // Attempt to resolve the record to an IP address
        try {
            const addresses = await dns.promises.resolve(
                record.value // Is a domain
            );
            record.value = addresses[0];
        } catch (err: any) {
            logger.error(
                `Cannot resolve ${record.name}: ${err.message}`
            );
        }
    }

    public addAnswer(answer: ANSWER) {
        this.response.answers.push(answer);
    }

    public async process(record: DNS_RECORD, question: DNS_QUESTION) {
        const type = recordTypeMap[question.type];
        logger.verbose(`[DNS] Processing record: type:${type} record:${record.type}`)
        if (type && type == record.type) {
            this.addAnswer(new DNSAnswerBuilder()
                .name(question.name)
                .type(question.type)
                .class_(Packet.CLASS.IN)
                .ttl(300)
                .address(record.value)
                .build()
            )
        } else if (
            type == "A" &&
            record.type == "CNAME"
        ) {
            // If the requested type is A and the found record is CNAME,
            // attempt to resolve the CNAME to an IP address and add it to
            // the response.
            try {
                await this.resolveRecord(record);
                this.addAnswer(new DNSAnswerBuilder()
                    .name(question.name)
                    .type(question.type)
                    .class_(Packet.CLASS.IN)
                    .ttl(300)
                    .address(record.value)
                    .build()
                )
            } catch (err: any) {
                logger.error(
                    `Cannot resolve CNAME to IP address: ${err.message}`
                );
            }
        }
    }

    public getResponse() {
        return this.response;
    }
}