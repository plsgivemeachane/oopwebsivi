import DatabaseManager from "../../utils/databaseManager";
import ReturnBuilder from "../ReturnBuilder";
import Route from "../Route";
import RouteGroup from "../RouteGroup";

export default new RouteGroup("/dns")
    .route(
        new Route("/domains", "get")
            // Get all domains
            .route(async (_, res) => {

                const dns_domains = await DatabaseManager.getDomainDns(true);

                return new ReturnBuilder()
                    .data(dns_domains)
                    .send(res);
            }),
        new Route("/domains/:domain_id", "get")
            // Get specific domain
            .route(async (req, res) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                return new ReturnBuilder()
                    .data(dns_domain)
                    .send(res);
            }),
        new Route("domains", "post")
            // Create domain
            .route(async (req, res) => {
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
        new Route("/domains/:domain_id", "delete")
            // Delete a domain
            .route(async (req, res) => {
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
        new Route("/domains/:domain_id/records", "get")
            // Get all records of a domain
            .route(async (req, res) => {
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
        new Route("/domains/:domain_id/records", "post")
            // Create a record
            .route(async (req, res) => {
                const dns_domain = await DatabaseManager.findDomainWithId(req.params.domain_id);
                if (!dns_domain)
                    return new ReturnBuilder()
                        .status(404)
                        .msg("Domain not found")
                        .send(res);

                const record: {
                    domainId: string
                    name: string
                    type: string
                    value: string
                    domain: string
                } = req.body;

                if (!record)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Missing record")
                        .send(res);

                if (!record.domainId)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Missing body: domain_id")
                        .send(res);

                if (!record.name)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Missing body: name")
                        .send(res);

                if (!record.type)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Missing body: type")
                        .send(res);

                if (!["A", "CNAME", "AAAA", "TXT"].includes(record.type))
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Unsupported body: type")
                        .send(res);

                if (!record.value)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Missing body: value")
                        .send(res);

                const existingDomain = await DatabaseManager.findDomainWithDomain(record.domain);
                if (!existingDomain)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Domain not found")
                        .send(res);


                // root
                if (record.name == "@")
                    record.name = existingDomain.domain;

                const domain = (record.name == existingDomain.domain) ? existingDomain.domain : `${record.name}.${existingDomain.domain}`;

                const existingRecord = await DatabaseManager.getDomainDnsRecordByName(existingDomain.id, domain, record.type);
                if (existingRecord)
                    return new ReturnBuilder()
                        .status(400)
                        .msg("Record already exists")
                        .send(res);


                await DatabaseManager.createDomainDnsRecord(existingDomain, record);
                return new ReturnBuilder()
                    .status(200)
                    .msg("Record created")
                    .send(res);

            }),
        new Route("/domains/:domain_id/records/:record_id", "delete")
            // Delete a record
            .route(async (req, res) => {
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

                return new ReturnBuilder()
                    .status(200)
                    .msg("Record deleted")
                    .send(res);

            })
    );