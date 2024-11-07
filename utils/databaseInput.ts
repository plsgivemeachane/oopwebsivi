import { PrismaClient } from "@prisma/client"
import Utils from "./Utils"

export default class DatabaseInput {
    private static readonly prisma = new PrismaClient()

    // --- Port Forwarding ---
    static async getPortFowarding() {
        return await this.prisma.forward_ports.findMany()
    }

    // --- Reserve Hosts ---
    static async getReserveHosts() {
        return await this.prisma.reserve_hosts.findMany()
    }


    // --- Domains ---
    static async getDomainDns(include_records = false) {
        const domains = await this.prisma.domain_dns.findMany({
            include: {
                records: include_records ? true : false
            }
        })
        return domains
    }

    static async getDomainDnsRecord(domain_id: string) {
        return await this.prisma.dns_records.findMany({
            where: {
                domain_id: domain_id
            }, 
            include: {
                domain: true
            }
        })
    }

    static async getDomainDnsRecordByName(domain_id: string, name: string, type: any) {
        return await this.prisma.dns_records.findFirst({
            where: {
                domain_id: domain_id,
                name: name,
                type: type
            }, 
            include: {
                domain: true
            }
        })
    }

    static async getDomainDnsRecordById(domain_id: string, record_id: string) {
        return await this.prisma.dns_records.findUnique({
            where: {
                id: record_id
            }, 
            include: {
                domain: true
            }
        })
    }

    static async deleteDomainDnsRecord(record_id: string) {
        return await this.prisma.dns_records.delete({
            where: {
                id: record_id
            }
        })
    }

    static async findDomainWithId(domain_id: string) {
        return await this.prisma.domain_dns.findUnique({
            where: {
                id: domain_id
            }, 
            include: {
                records: true
            }
        })
    }

    static async findDomainWithDomain(domain: string) {
        return await this.prisma.domain_dns.findUnique({
            where: {
                domain: domain
            }, 
            include: {
                records: true
            }
        })
    }

    static async createDomain(domain: string) {
        return await this.prisma.domain_dns.create({
            data: {
                id: Utils.snowflakeId(),
                domain: domain
            }
        })
    }

    static async deleteDomain(domain: any) {
        return await this.prisma.domain_dns.delete({
            where: domain
        })
    }

    static async createDomainDnsRecord(existingDomain: any, record: any) {
        return await this.prisma.dns_records.create({
            data: {
                id: Utils.snowflakeId(),
                domain_id: existingDomain.id,
                name: record.name,
                type: record.type,
                value: record.value,
                create_at: String(Date.now())
            }
        })
    }
}


// TODO
// const record = await App.prisma.dns_records.findFirst({
//     where: {
//         name: question.name.toLowerCase()
//     },
//     include: { domain: true }
// });
