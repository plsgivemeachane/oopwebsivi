import RouteGroup from "../RouteGroup";
import Route from "../Route";
import DatabaseManager from "../../utils/databaseManager";
import ReturnBuilder from "../ReturnBuilder";
import { Portforwading_protocols } from "@prisma/client";
import PortForwardingManager from "../../proxy/port_fowarding/port_forwarding_manger";
import Utils from "../../utils/Utils";

interface PortForwardingData {
    incoming_port: number;
    target_host: string;
    target_port: number;
    protocol: Portforwading_protocols;
}

export default new RouteGroup("/portforwarding")
    .route(
        new Route("/ports", "get").route(async (req, res) => {
            const forwarding_ports = await DatabaseManager.getPortForwarding();
            return new ReturnBuilder()
                .status(200)
                .msg("Success")
                .data(forwarding_ports)
                .send(res)
        }),
        new Route("/ports", "post").route(async (req, res) => {
            const data: PortForwardingData = req.body;
            if (!data.incoming_port) return new ReturnBuilder()
                .status(400)
                .msg("Missing body: incoming_port")
                .send(res);
            if (data.incoming_port < 1 || data.incoming_port > 65535) return new ReturnBuilder()
                .status(400)
                .msg("Invalid body: incoming_port must be in range 1 <= incoming_port <= 65535")
                .send(res);
            if (!data.target_host) return new ReturnBuilder()
                .status(400)
                .msg("Missing body: target_host")
                .send(res);
            if (!data.target_port) return new ReturnBuilder()
                .status(400)
                .msg("Missing body: target_port")
                .send(res);
            if (data.target_port < 1 || data.target_port > 65535) return new ReturnBuilder()
                .status(400)
                .msg("Invalid body: target_port must be in range 1 <= target_port <= 65535")
                .send(res);
            if (!data.protocol) return new ReturnBuilder()
                .status(400)
                .msg("Missing body: protocol")
                .send(res);
            if (!["tcp", "udp"].includes(data.protocol)) return new ReturnBuilder()
                .status(400)
                .msg("Unsupported body: protocol")
                .send(res);

            const existingPort = await DatabaseManager.getPortForwardingByPort(data.incoming_port)
            if (existingPort) return new ReturnBuilder()
                .status(400)
                .msg("Port forwarding already exists")
                .send(res)

            // Create the port forwarding
            await DatabaseManager.createPortForwarding(data.incoming_port, data.target_port, data.target_host, data.protocol)

            PortForwardingManager.getInstance().restart()

            return new ReturnBuilder()
                .status(200)
                .msg("Success")
                .send(res)
        }),
        new Route("/ports/:port_id", "delete").route(async (req, res) => {
            const port_id = req.params.port_id;
            if (!port_id) return new ReturnBuilder()
                .status(400)
                .msg("Missing port_id")
                .send(res)
            const existingPort = await DatabaseManager.getPortForwardingByPortId(port_id)
            if(!existingPort) return new ReturnBuilder()
                .status(400)
                .msg("Port forwarding does not exist")
                .send(res)

            // Remove the port forwarding
            await DatabaseManager.removePortForwarding(port_id)

            PortForwardingManager.getInstance().restart()

            return new ReturnBuilder()
                .status(200)
                .msg("Success")
                .send(res)
        }),
        new Route("/ports/:port_id", "get").route(async (req, res) => {
            const port_id = req.params.port_id;
            if (!port_id) return new ReturnBuilder()
                .status(400)
                .msg("Missing port_id")
                .send(res)

            const existingPort = await DatabaseManager.getPortForwardingByPortId(port_id)
            if(!existingPort) return new ReturnBuilder()
                .status(400)
                .msg("Port forwarding does not exist")
                .send(res)

            const data: any = existingPort;

            if(existingPort.protocol == "tcp") {
                const online = await Utils.checkTcpPortOnline(
                    data.target_host,
                    data.target_port
                )

                data.status = online ? "staged" : "unstaged";
            } else {
                const online = await Utils.checkUdpPortOnline(
                    data.target_host,
                    data.target_port
                )

                data.status = online ? "staged" : "unstaged";

            }

            return new ReturnBuilder()
                .status(200)
                .msg("Success")
                .data(data)
                .send(res)
        })
    )