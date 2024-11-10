export interface Validatable {
    status: boolean;
    message: string;
}

interface ExtendedStringMap extends Object {
    [key: string]: any;
}

export default class ValidatableJSON<T extends ExtendedStringMap> {
    private readonly _json: T | undefined | null;

    constructor(json: T | undefined | null) {
        this._json = json;
    }

    validate(): Validatable {
        if(!this._json)
            return {
                status: false,
                message: "Object not provided"
            }
        const keys = Object.keys(this._json);
        if (keys.length > 0) {
            for (const k of keys) {
                // If null or undefined (considered missing)
                if (this._json[k] === undefined || this._json[k] === null) {
                    return { status: false, message: `Missing: ${k}` };
                }
            }
            return { status: true, message: "Validation successful" };
        } else {
            return { status: true, message: "Object not provided" };
        }
    }
}