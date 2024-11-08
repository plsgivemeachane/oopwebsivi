import Route from "../Route"
import { JWT } from 'quanvnjwt'
import dotenv from 'dotenv'
dotenv.config()

const jwtClient = new JWT(process.env.JWT_SECRET??"")

export default new Route("/login", 'post', false)
    .route((req, res) => {
        const { username, password } = req.body
        if(!username || !password) {
            return res.status(400).send("Missing username or password")
        }

        if (username !== "admin" || password !== "admin") { // TODO: Remove this    
            return res.status(401).send("Invalid username or password")
        }

        const token = jwtClient.sign({
            username: username,
            password: password
        })

        res.status(200).send({
            token: token
        })
    })