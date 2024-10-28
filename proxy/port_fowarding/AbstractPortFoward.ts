export default abstract class AbstractPortFoward {
    abstract setup(): AbstractPortFoward
    abstract start(): void
    abstract stop(): void
}