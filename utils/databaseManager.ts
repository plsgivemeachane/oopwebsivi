import { Hostreserving_protocols, Portforwading_protocols, PrismaClient } from "@prisma/client";
import Utils from "./Utils";

export default class DatabaseManager {
    private static readonly prisma = new PrismaClient()

    // --- Port Forwarding ---
    static async getPortForwarding() {
        return this.prisma.forward_ports.findMany();
    }

    static async getPortForwardingByPort(port: number) {
        return this.prisma.forward_ports.findUnique({
            where: {
                incoming_port: port
            }
        })
    }

    static async getPortForwardingByPortId(port_id: string) {
        return this.prisma.forward_ports.findUnique({
            where: {
                id: port_id
            }
        })
    }

    static async removePortForwarding(port_id: string) {
        return this.prisma.forward_ports.delete({
            where: {
                id: port_id
            }
        });
    }

    static async createPortForwarding(incoming_port: number, target_port: number, target_host: string, protocol: Portforwading_protocols) {
        return this.prisma.forward_ports.create({
            data: {
                id: Utils.snowflakeId(),
                incoming_port,
                internal_host: target_host,
                internal_port: target_port,
                protocol,
            }
        });
    }

    // --- Reserve Hosts ---
    static async getReserveHosts() {
        return this.prisma.reserve_hosts.findMany();
    }

    static async findReverseHostByDomainName(domain: string) {
        return this.prisma.reserve_hosts.findUnique({
            where: {
                domain
            }
        });
    }

    static async findReverseHostByDomainId(id: string) {
        return this.prisma.reserve_hosts.findUnique({
            where: {
                id
            }
        });
    }


    static async createReverseHost(domain: string, target_address: string, protocol: Hostreserving_protocols) {
        return this.prisma.reserve_hosts.create({
            data: {
                id: Utils.snowflakeId(),
                domain,
                target_address,
                protocol
            }
        })
    }

    static async deleteReserveHost(id: string) {
        return this.prisma.reserve_hosts.delete({
            where: {
                id
            }
        })
    }

    // --- Domains ---
    static async getDomainDns(include_records = false) {
        return this.prisma.domain_dns.findMany({
            include: {
                records: include_records
            }
        });
    }

    static async getDomainDnsRecord(domain_id: string) {
        return this.prisma.dns_records.findMany({
            where: {
                domain_id: domain_id
            },
            include: {
                domain: true
            }
        });
    }

    static async getDomainDnsRecordByName(domain_id: string, name: string, type: any) {
        return this.prisma.dns_records.findFirst({
            where: {
                domain_id: domain_id,
                name: name,
                type: type
            },
            include: {
                domain: true
            }
        });
    }

    static async getDomainDnsRecordById(domain_id: string, record_id: string) {
        return this.prisma.dns_records.findUnique({
            where: {
                id: record_id
            },
            include: {
                domain: true
            }
        });
    }

    static async deleteDomainDnsRecord(record_id: string) {
        return this.prisma.dns_records.delete({
            where: {
                id: record_id
            }
        });
    }

    static async findDomainWithId(domain_id: string) {
        return this.prisma.domain_dns.findUnique({
            where: {
                id: domain_id
            },
            include: {
                records: true
            }
        });
    }

    static async findDomainWithDomain(domain: string) {
        return this.prisma.domain_dns.findUnique({
            where: {
                domain: domain
            },
            include: {
                records: true
            }
        });
    }

    static async createDomain(domain: string) {
        return this.prisma.domain_dns.create({
            data: {
                id: Utils.snowflakeId(),
                domain: domain
            }
        });
    }

    static async deleteDomain(domain: any) {
        return this.prisma.domain_dns.delete({
            where: domain
        });
    }

    static async createDomainDnsRecord(existingDomain: any, record: any) {
        return this.prisma.dns_records.create({
            data: {
                id: Utils.snowflakeId(),
                domain_id: existingDomain.id,
                name: record.name,
                type: record.type,
                value: record.value,
                create_at: String(Date.now())
            }
        });
    }
}