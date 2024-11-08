import express from 'express'
import { logger } from "../utils/winston";
import Route from "./Route";
import { JWT } from 'quanvnjwt'

export default class Middlewares {

    public static authUserUsingJWT(req: express.Request, res: express.Response) {
        logger.info("authencating...")
        // check jwt
        const token = req.headers.authorization
        if (!token) {
            logger.warn("No token provided")
            res.status(401).send('Unauthorized')
            return false
        }

        const token_data = token.split(' ')

        if (token_data.length !== 2) {
            logger.warn("Invalid token")
            res.status(401).send('Unauthorized')
            return false
        }

        const jwt = new JWT("SECRET")
        const stats = jwt.verify(token_data[1])

        if(!stats.status) {
            logger.warn("Invalid token")
            res.status(401).send('Unauthorized')
            return false
        }

        logger.info("Authenticated")
        // res.status(200).send('Authorized')
        return true
    }

    public static auth(route: Route) {
        route.route(this.authUserUsingJWT)
    }

}