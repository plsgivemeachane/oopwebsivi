import express from 'express'
import { logger } from "../utils/winston";
import Route from "./Route";
import { JWT } from 'quanvnjwt'
import dotenv from 'dotenv'
dotenv.config()

export default class Middlewares {

    public static authUserUsingJWT(req: express.Request, res: express.Response) {
        logger.verbose("[MW] authencating...")
        // check jwt
        const token = req.headers.authorization
        if (!token) {
            logger.verbose("[MW] No token provided")
            res.status(401).send('[MW] Unauthorized')
            return false
        }

        const token_data = token.split(' ')

        if (token_data.length !== 2) {
            logger.verbose("[MW] Invalid token")
            res.status(401).send('[MW] Unauthorized')
            return false
        }

        const jwt = new JWT(process.env.JWT_SECRET??"")
        const stats = jwt.verify(token_data[1])

        if(!stats.status) {
            logger.verbose("[MW] Invalid token")
            res.status(401).send('[MW] Unauthorized')
            return false
        }

        logger.verbose("[MW] Authenticated")
        // res.status(200).send('Authorized')
        return true
    }

    public static auth(route: Route) {
        route.route(this.authUserUsingJWT)
    }

}