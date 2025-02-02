/*

Handle request comming to a specify route.
Middleware (Also the route handler itself) is an InjectableRequest
- Variable:
    - route: string
        - The route to handle
    - middleware: InjectableRequest
    - method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
*/
import InjectableRequest, { routeFunction, routeReturnFunction } from "../requests/InjectableRequest";
import Middlewares from "./Middleware";
import { RequestType } from "./RequestType";
export default class Route {
    private readonly path: string; // private readonly = const
    private readonly method: RequestType;
    private readonly handler: InjectableRequest;

    constructor(route: string, method: RequestType, auth = true) {
        this.path = route;
        this.handler = new InjectableRequest();
        this.method = method;

        if(auth) Middlewares.auth(this)

        return this;
    }

    public route(fn: routeReturnFunction | routeFunction) {
        this.handler.addRoutePossibleReturn(fn);
        return this;
    }

    // public get(fn: routeReturnFunction) {
    //     this.method = "get";
    //     this.handler.addRoutePossibleReturn(fn)
    // }

    public getRoute() {
        return this.path;
    }
    
    public getHandler() {
        return this.handler.getHandler();
    }

    public getMethod(): RequestType {
        return this.method;
    }
}