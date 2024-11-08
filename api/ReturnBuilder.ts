import express from "express";

export const msgMap : {
    [key: number]: string
} = {
    200: "OK",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
}

export default class ReturnBuilder {
    private status_: number;
    private data_: any;
    private msg_: string;

    constructor() {
        this.status_ = 200;
        this.data_ = "";
        this.msg_ = "OK";
    }

    public status(status: number) {
        this.status_ = status;
        this.msg_ = msgMap[status];
        return this;
    }

    public data(data: any) {
        this.data_ = data;
        return this;
    }

    public msg(msg: string) {
        this.msg_ = msg;
        return this;
    }

    public send(res: express.Response) {
        return res.json({
            status: this.status_,
            msg: this.msg_,
            data: this.data_
        })
    }
}