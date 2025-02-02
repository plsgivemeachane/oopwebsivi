import Route from "../../Route";
import APIServer from "../../api_server";
import { RequestType } from "../../RequestType";

export default new Route("/logs", RequestType.GET)
    .route((req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendLog = (data: string) => {
            res.write(`data: ${data}\n\n`);
        }

        APIServer.getObservable().subscribe(sendLog)

        req.on("close", () => {
            // Client close connection
            APIServer.getObservable().unsubscribe(sendLog)
            res.end();
        })
    })