import Route from "../Route";
import { RequestType } from "../RequestType";

export default new Route("/test", RequestType.GET)
    .route((req, res) => {
        return res.send("Hello World")
    })