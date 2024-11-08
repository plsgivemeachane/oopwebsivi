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
type Method = "get" | "post" | "put" | "delete" | "patch";

export default class Route {
    private readonly path: string; // private readonly = const
    private method: Method;
    private readonly handler: InjectableRequest;

    constructor(route: string, method: Method, auth = true) {
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

    public getMethod() {
        return this.method;
    }
}