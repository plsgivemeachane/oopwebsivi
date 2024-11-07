import { PrismaClient } from "@prisma/client"

export default class DatabaseInput {
    static readonly prisma = new PrismaClient()
    static async getPortFowarding() {
        return await this.prisma.forward_ports.findMany()
    }

    static async getReserveHosts() {
        return await this.prisma.reserve_hosts.findMany()
    }

    static async getDomainDns() {
        return await this.prisma.domain_dns.findMany()
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
}


// TODO
// const record = await App.prisma.dns_records.findFirst({
//     where: {
//         name: question.name.toLowerCase()
//     },
//     include: { domain: true }
// });
