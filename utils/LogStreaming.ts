import Transport from 'winston-transport'
import Observable from "./Observable";

interface logInfo {
    message: string;
    level: string;
    timestamp: string;

    [key: symbol]: string;
}

export class LogStreaming extends Transport {

    private readonly observable: Observable<string>;

    constructor(opts: any) {
        super(opts);
        this.observable = opts.observable;
    }

    log(info: logInfo, next: () => void): any {
        setImmediate(() => {
            this.emit('logged', info);
        });

        this.observable.notify(info.message);

        next();
    }

}