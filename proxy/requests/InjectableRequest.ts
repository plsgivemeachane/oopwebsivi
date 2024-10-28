import * as express from 'express'
import { logger } from '../../utils/winston'

export default class InjectableRequest {
    private routes: ((req: express.Request, res: express.Response) => Promise<boolean>)[]

    constructor() {
        this.routes = []
    }

    /**
     * Adds an asynchronous route to the list of routes.
     * The route is executed sequentially after all previously added routes.
     * The route is expected to return a Promise that resolves when the route is finished.
     * If the route returns a rejected Promise, the error is logged to the console but the request is not aborted.
     *
     * @param route - A function that takes an Express request and response object, and performs asynchronous operations.
     */
    public addRoute(route: (req: express.Request, res: express.Response) => Promise<boolean>) {
        this.routes.push(route)
    }

    /**
     * Adds a synchronous route to the list of routes by wrapping it in an asynchronous function.
     * The route is executed using `process.nextTick` to schedule it for the next event loop iteration.
     *
     * @param route - A function that takes an Express request and response object, and performs synchronous operations.
     */
    public addRouteAsynchronous(route: (req: express.Request, res: express.Response) => boolean) {
        // TODO: Very stupid code
        this.routes.push(
            (req: express.Request, res: express.Response) => new Promise(
                (resolve, reject) => {
                    process.nextTick(() => {
                        try {
                            const result = route(req, res)
                            if (result) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        } catch (error) {
                            reject(error)
                        }
                    })
                }
            )
        )
    }

    /**
     * Returns a handler function that processes incoming HTTP requests.
     * The handler logs the request method, URL, and IP address, then sequentially executes all registered routes.
     * Each route is awaited to ensure proper asynchronous operations.
     *
     * @returns An asynchronous function that takes an Express request and response object, logging the request details and executing all routes.
     */
    public getHandler() {
        return async (req: express.Request, res: express.Response) => {
            logger.info(`-> ${req.method} ${req.url} --- ${req.ip}`)
            try {
                for(let route of this.routes) {
                    // logger.info("Executing route --- " + route.name)
                    if(!await route(req, res)) {
                        // Cancel request if route returns false | Not always true
                        // logger.warn(`Route aborted request`);
                        return;
                    }
                }
            } catch (error: any) {
                logger.error(`Error processing request: ${error.message}`);
            }
        }
    }

}