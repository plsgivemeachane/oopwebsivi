import Route from "../Route"

export default new Route("/test", 'get')
    .route((req, res) => {
        return res.send("Hello World")
    })