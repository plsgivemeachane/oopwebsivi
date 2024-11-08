export default class Observable<T> {
    private _observers: any[] = [];
    public subscribe(observer: Function) {
        this._observers.push(observer);
    }
    public unsubscribe(observer: Function) {
        this._observers = this._observers.filter(o => o !== observer);
    }
    public notify(data: T) {
        this._observers.forEach(o => o(data));
    }
}