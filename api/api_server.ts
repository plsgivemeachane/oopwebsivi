import Route from "./Route";
import express from 'express'
import http from 'http'
import { logger } from "../utils/winston";
import RouteGroup from "./RouteGroup";



export default class APIServer {
    private routes: (Route | RouteGroup)[];
    public port: number;

    constructor() {
        this.routes = [];
        this.port = 8080;
    }

    public addRoute(route: Route | RouteGroup) {
        // if (route instanceof Route) logger.info(`[API Server] Adding route: ${route.getRoute()}`)
        // else if (route instanceof RouteGroup) logger.info(`[API Server] Adding route group: ${route.getPath()}`)
        this.routes.push(route);
    }

    public start() {
        // TODO: Need refactor with another class
        if(this.routes.length == 0) {
            throw new Error("No routes to start")
        }

        const app = express();
        const server = http.createServer(app);
        // Middleware
        app.use(express.json());
        // app.use(MiddlewareController.lol)

        const root = new RouteGroup("/")
        for(let route of this.routes) {
            root.route(route)
        }

        app.use(root.getPath(), root.getRouter())

        server.listen(this.port, () => {
            logger.info(`[API Server] API Server listening on port 8080...`);
        });

    }
}