import HttpProxy from "../../proxy/proxy/http_proxy";
import { logger } from "../../utils/winston";
import { RequestType } from "../RequestType";
import Route from "../Route";

export default new Route("/app*", RequestType.GET, false)
    .route((req, res) =>{
        const proxy = new HttpProxy(
            2711, "localhost", "/", "App Proxy"
        )

        proxy.setup()

        return proxy.getHandler()(req, res)
    })
