import Route from "./Route";
import express from 'express'
import http from 'http'
import { logger } from "../utils/winston";

export default class APIServer {
    private routes: Route[];
    public port: number;

    constructor() {
        this.routes = [];
        this.port = 8080;
    }

    public addRoute(route: Route) {
        logger.info(`[API Server] Adding route: ${route.getRoute()}`)
        this.routes.push(route);
    }

    public start() {
        // TODO: Need refactor with another class
        if(this.routes.length == 0) {
            throw new Error("No routes to start")
        }

        const app = express();
        const server = http.createServer(app);
        app.use(express.json());
        for(let route of this.routes) {
            app[route.getMethod()](route.getRoute(), route.getHandler());
        }

        server.listen(this.port, () => {
            logger.info(`[API Server] API Server listening on port 8080...`);
        });

    }
}