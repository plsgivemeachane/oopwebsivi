import RouteGroup from "../../RouteGroup";
import Route from "../../Route";
import DatabaseManager from "../../../utils/databaseManager";
import ReturnBuilder from "../../ReturnBuilder";
import { RequestType } from "../../RequestType";
import ValidatableJSON from "../../ValidateData";
import * as domain from "node:domain";
import ReverseProxyManager from "../../../proxy/reverse_proxy/reverse_proxy_manager";
import Utils from "../../../utils/Utils";

type HttpUrlWithPort = `http${'s' | ''}://${string}:${number}`;
interface HostsData {
    domain: string,
    target_address: HttpUrlWithPort,
    protocol: "http" | "https"
}

export default new RouteGroup("/reverseproxy")
    .route(
        new Route("/hosts", RequestType.GET)
            .route(async (req, res) => {
                const data = await DatabaseManager.getReserveHosts();

                return new ReturnBuilder()
                    .status(200)
                    .data(data)
                    .send(res)
            }),
        new Route("/hosts", RequestType.POST)
            .route(async (req, res) => {
                const data: HostsData = req.body
                const validateResult = new ValidatableJSON<HostsData>(data).validate();
                if(!validateResult.status) {
                    return new ReturnBuilder().status(400).msg(validateResult.message)
                }
                if (!data.target_address.startsWith('http') && data.target_address.startsWith('http')) return res.json({
                    code: 400,
                    msg: 'Invalid body: target_address must be started with http/https'
                });
                if (isNaN(Number(data.target_address.split(':')[2]))) return res.json({
                    code: 400,
                    msg: 'Invalid body: target_address must be contained a port'
                });
                if (!['http', 'https'].includes(data.protocol)) return res.json({
                    code: 400,
                    msg: 'Unsupported body: protocol'
                });

                const existingHost = await DatabaseManager.findReverseHostByDomainName(data.domain)
                if (existingHost) return new ReturnBuilder()
                    .status(400)
                    .msg("Host already exists")
                    .send(res)

                Utils.defer(async () => DatabaseManager.createReverseHost(data.domain, data.target_address, data.protocol), 200)

                ReverseProxyManager.getInstance().addReverseProxyFromData(data)

                return new ReturnBuilder()
                    .status(200)
                    .msg("Host created")
                    .send(res)
            }),
        new Route("/hosts/:domain", RequestType.DELETE)
            .route(async (req, res) => {
                const domain = req.params.domain;
                const data = await DatabaseManager.findReverseHostByDomainId(domain)
                if (!data) return new ReturnBuilder()
                    .status(404)
                    .msg("Host not found")

                Utils.defer(async () => await DatabaseManager.deleteReserveHost(domain), 200)

                ReverseProxyManager.getInstance().removeReverseProxyByName(domain)

                return new ReturnBuilder()
                    .status(200)
                    .msg("Host deleted")
                    .send(res)
            })
    )