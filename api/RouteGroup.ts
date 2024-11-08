import { logger } from "../utils/winston";
import Route from "./Route";
import express from "express";

export default class RouteGroup {
    private readonly router: express.Router;
    private readonly path: string;

    constructor(path: string) {
        this.path = path;
        this.router = express.Router();
        return this
    }

    public route(...routes: (Route | RouteGroup)[]) { 
        for(let route of routes) {
            if(route instanceof Route) {
                logger.info(`[API Server] [${this.path}] Adding route: ${route.getMethod().toUpperCase()} ${route.getRoute()}`)
                this.router.use(route.getRoute(), route.getHandler())
            } else {
                logger.info(`[API Server] [${this.path}] Adding route group: ${route.getPath()}`)
                this.router.use(route.getPath(), route.getRouter())
            }
        }
        return this
    }

    public getRouter() {
        return this.router;
    }

    public getPath() {
        return this.path;
    }
}