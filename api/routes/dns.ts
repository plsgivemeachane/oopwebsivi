import DatabaseInput from "../../utils/databaseInput";
import ReturnBuilder from "../ReturnBuilder";
import Route from "../Route";
import RouteGroup from "../RouteGroup";

export default new RouteGroup("/dns")
    .route(
        new Route("/domains", "get")
            // Get all domains
            .route(async (req, res) => {
                
                const dns_domains = await DatabaseInput.getDomainDns(true)

                return res.json(new ReturnBuilder()
                    .data(dns_domains)
                    .build()
                )
            }),
        new Route("/domains/:domain_id", "get")
            // Get specific domain
            .route(async (req, res) => {
                const dns_domain = await DatabaseInput.findDomainWithId(req.params.domain_id)
                return res.json(new ReturnBuilder()
                    .data(dns_domain)
                    .build()
                )
            }),
        new Route("domains", "post")
            // Create domain
            .route(async (req, res) => {
                const domain = req.body.domain;
                
                if (!domain) 
                    return res.json(new ReturnBuilder()
                        .status(400)
                        .msg('Missing domain')
                        .build()
                    )
                
                const existingDomain = await DatabaseInput.findDomainWithDomain(domain)

                if (existingDomain)
                    return res.json(new ReturnBuilder()
                        .status(400)
                        .msg('Domain already exists')
                        .build()
                    )

                await DatabaseInput.createDomain(domain)
                return res.json(new ReturnBuilder()
                    .status(200)
                    .msg('Domain created')
                    .build()
                )
            }),
        new Route("/domains/:domain_id", "delete")
            // Delete a domain
            .route(async (req, res) => {
                const dns_domain = await DatabaseInput.findDomainWithId(req.params.domain_id)
                if (!dns_domain)
                    return res.json(new ReturnBuilder()
                        .status(404)
                        .msg('Domain not found')
                        .build()
                    )

                await DatabaseInput.deleteDomain({
                    where: {
                        id: req.params.domain_id
                    }
                })

                return res.json(new ReturnBuilder()
                    .status(200)
                    .msg('Domain deleted')
                    .build()
                )
            }),
        new Route("/domains/:domain_id/records", "get")
            // Get all records of a domain
            .route(async (req, res) => {
                const dns_domain = await DatabaseInput.findDomainWithId(req.params.domain_id)
                if (!dns_domain)
                    return res.json(new ReturnBuilder()
                        .status(404)
                        .msg('Domain not found')
                        .build()
                    )

                const dns_records = await DatabaseInput.getDomainDnsRecord(dns_domain.id)

                return res.json(new ReturnBuilder()
                    .data(dns_records)
                    .build()
                )
            }),
        new Route("/domains/:domain_id/records", "post")
            // Create a record
            .route(async (req, res) => {
                const dns_domain = await DatabaseInput.findDomainWithId(req.params.domain_id)
                if (!dns_domain)
                    return res.json(new ReturnBuilder()
                        .status(404)
                        .msg('Domain not found')
                        .build()
                    )

                const record = req.body.record;

                if (!record) 
                    return res.json(new ReturnBuilder()
                        .status(400)
                        .msg('Missing record')
                        .build()
                    )
                
                if (!record.domainId) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Missing body: domain_id')
                    .build()
                )
                
                if (!record.name) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Missing body: name')
                    .build()
                )
                
                if (!record.type) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Missing body: type')
                    .build()
                )
                
                if (!['A', 'CNAME', 'AAAA', 'TXT'].includes(record.type)) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Unsupported body: type')
                    .build()
                )

                if (!record.value) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Missing body: value')
                    .build()
                )

                const existingDomain = await DatabaseInput.findDomainWithDomain(record.domain)
                if (!existingDomain) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Domain not found')
                    .build()
                )
                
                // root
                if (record.name == '@') record.name = existingDomain.domain

                const domain = (record.name == existingDomain.domain) ? existingDomain.domain : `${record.name}.${existingDomain.domain}` 

                const existingRecord = await DatabaseInput.getDomainDnsRecordByName(existingDomain.id, domain, record.type)
                if (existingRecord) return res.json(new ReturnBuilder()
                    .status(400)
                    .msg('Record already exists')
                    .build()
                )

                await DatabaseInput.createDomainDnsRecord(existingDomain, record)
                return res.json(new ReturnBuilder()
                    .status(200)
                    .msg('Record created')
                    .build()
                )
            }),
        new Route("/domains/:domain_id/records/:record_id", "delete")
            // Delete a record
            .route(async (req, res) => {
                const dns_domain = await DatabaseInput.findDomainWithId(req.params.domain_id)
                if (!dns_domain)
                    return res.json(new ReturnBuilder()
                        .status(404)
                        .msg('Domain not found')
                        .build()
                    )

                const dns_record = await DatabaseInput.getDomainDnsRecordById(dns_domain.id, req.params.record_id)
                if (!dns_record)
                    return res.json(new ReturnBuilder()
                        .status(404)
                        .msg('Record not found')
                        .build()
                    )

                await DatabaseInput.deleteDomainDnsRecord(dns_record.id)

                return res.json(new ReturnBuilder()
                    .status(200)
                    .msg('Record deleted')
                    .build()
                )
            })
    )