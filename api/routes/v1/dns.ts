import DatabaseManager from "../../../utils/databaseManager";
import ReturnBuilder from "../../ReturnBuilder";
import Route from "../../Route";
import RouteGroup from "../../RouteGroup";
import { Request, Response } from "express";
import { RequestType } from "../../RequestType";
import ValidatableJSON from "../../ValidateData";
import DNSServer from "../../../dns/DNSServer";
import Utils from "../../../utils/Utils";

interface RecordData {
    domainId: string
    name: string
    type: "A" | "CNAME" | "AAAA" | "TXT"
    value: string
    domain: string
}

export default new RouteGroup("/dns")
    .route(
        new Route("/domains", RequestType.GET)
            // Get all domains
            .route(async (_: Request, res: Response) => {

                const dns_domains = await DatabaseManager.getDomainDns(true);

                return new ReturnBuilder()
                    .data(dns_domains)
                    .send(res);
            }),
        new Route("/domains/:domain_id", RequestType.GET)
            // Get specific domain
            .route(async (req: Request, res: Response) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                return new ReturnBuilder()
                    .data(dns_domain)
                    .send(res);
            }),
        new Route("domains", RequestType.POST)
            // Create domain
            .route(async (req: Request, res: Response) => {
                const domain = req.body.domain;

                if (!domain)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Missing domain")
                        .send(res);

                const existingDomain = await DatabaseManager.findDomainWithDomain(domain);

                if (existingDomain)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Domain already exists")
                        .send(res);

                await DatabaseManager.createDomain(domain);
                return new ReturnBuilder()
                    .status(200)
                    .msg("Domain created")
                    .send(res);
            }),
        new Route("/domains/:domain_id", RequestType.DELETE)
            // Delete a domain
            .route(async (req: Request, res: Response) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                if (!dns_domain)
                    return new ReturnBuilder()
                        .status(404)
                        .msg("Domain not found")
                        .send(res);

                await DatabaseManager.deleteDomain({
                    where: {
                        id: req.params.domain_id
                    }
                });

                return new ReturnBuilder()
                    .status(200)
                    .msg("Domain deleted")
                    .send(res);
            }),
        new Route("/domains/:domain_id/records", RequestType.GET)
            // Get all records of a domain
            .route(async (req: Request, res: Response) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                if (!dns_domain)
                    return new ReturnBuilder()
                        .status(404)
                        .msg("Domain not found")
                        .send(res);

                const dns_records = await DatabaseManager.getDomainDnsRecord(dns_domain.id);

                return new ReturnBuilder()
                    .data(dns_records)
                    .send(res);
            }),
        new Route("/domains/:domain_id/records", RequestType.POST)
            // Create a record
            .route(async (req: Request, res: Response) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                if (!dns_domain)
                    return new ReturnBuilder()
                        .status(404)
                        .msg("Domain not found")
                        .send(res);

                const record: RecordData = req.body;

                const validateResult = new ValidatableJSON<RecordData>(record).validate()
                if(!validateResult.status) {
                    return new ReturnBuilder()
                        .status(400)
                        .msg(validateResult.message)
                }

                const existingDomain = await DatabaseManager.findDomainWithDomain(record.domain);
                if (!existingDomain)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Domain not found")
                        .send(res);

                // root
                if (record.name == "@")
                    record.name = existingDomain.domain;

                const domain_name = (record.name == existingDomain.domain) ? existingDomain.domain : `${record.name}.${existingDomain.domain}`;

                const existingRecord = await DatabaseManager.getDomainDnsRecordByName(existingDomain.id, domain_name, record.type);
                if (existingRecord)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Record already exists")
                        .send(res);

                // Just a trick lord
                const { domain, ...DNSRecord } = record;

                DNSServer.getInstance().addRecord({
                    ...DNSRecord,
                    domain_id: existingDomain.id,
                })

                Utils.defer(async () => await DatabaseManager.createDomainDnsRecord(existingDomain, record), 200);

                return new ReturnBuilder()
                    .status(200)
                    .msg("Record created")
                    .send(res);

            }),
        new Route("/domains/:domain_id/records/:record_id", RequestType.DELETE)
            // Delete a record
            .route(async (req: Request, res: Response) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                if (!dns_domain)
                    return new ReturnBuilder()
                        .status(404)
                        .msg("Domain not found")
                        .send(res);


                const dns_record = await DatabaseManager.getDomainDnsRecordById(dns_domain.id, req.params.record_id);
                if (!dns_record)
                    return new ReturnBuilder()
                        .status(404)
                        .msg("Record not found")
                        .send(res);

                await DatabaseManager.deleteDomainDnsRecord(dns_record.id);

                // Restart the dns server b/c I can't fuktup it rn
                // TODO Need refactor for better performance

                await DNSServer.getInstance().stop()

                return new ReturnBuilder()
                    .status(200)
                    .msg("Record deleted")
                    .send(res);

            })
    );