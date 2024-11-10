import Route from "./Route";
import express from 'express'
import http from 'http'
import { logger } from "../utils/winston";
import RouteGroup from "./RouteGroup";
import Observable from "../utils/Observable";
import dotenv from "dotenv";
dotenv.config();


export default class APIServer {
    private readonly routes: (Route | RouteGroup)[];
    public port: number;

    private static readonly observable: Observable<string> = new Observable<string>();

    constructor() {
        this.routes = [];
        this.port = process.env.API_SERVER_PORT ? parseInt(process.env.API_SERVER_PORT) : 8080;
    }

    public addRoute(route: Route | RouteGroup) {
        // if (route instanceof Route) logger.info(`[API Server] Adding route: ${route.getRoute()}`)
        // else if (route instanceof RouteGroup) logger.info(`[API Server] Adding route group: ${route.getPath()}`)
        this.routes.push(route);
    }

    public start() {
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

    public static getObservable(): Observable<string> {
        return this.observable;
    }
}