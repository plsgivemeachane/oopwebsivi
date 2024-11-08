import { Snowflake } from "nodejs-snowflake";
import net from "net";
import dgram from "dgram";

export default class Utils {
    private static readonly uid = new Snowflake({ 
        custom_epoch: 19112021000, // Defaults to Date.now(). This is UNIX timestamp in ms
        instance_id: undefined // A value ranging between 0 - 4095. If not provided then a random value will be used
    });
    
    static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static snowflakeId() {
        return this.uid.idFromTimestamp(Date.now()).toString()
    }

    static defer(fn: Function, ms: number) {
        setTimeout(fn, ms);
    }

    static async checkTcpPortOnline(internal_host: string, internal_port: number) {
        return await new Promise<boolean>(async (resolve, reject) => {
            const socket = new net.Socket();
            socket.setTimeout(5000);
            socket.on('connect', function() {
                resolve(true);
                socket.destroy();
            });
            socket.on('timeout', function() {
                resolve(false);
                socket.destroy();
            });
            socket.on('error', function(err) {
                resolve(false);
            });
            socket.connect(internal_port, internal_host);
        });
    }

    static async checkUdpPortOnline(internal_host: string, internal_port: number) {
        return await new Promise<boolean>((resolve, reject) => {
            const message = Buffer.from('Ping');
            const client = dgram.createSocket('udp4');
            client.send(message, 0, message.length, internal_port, internal_host, function (err) {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
                client.close();
            });
            client.on('error', function (err) {
                resolve(false);
                client.close();
            });
            client.on('message', function (msg, _) {
                resolve(true);
                client.close();
            });

            this.defer(() => {
                client.close()
                resolve(false);
            }, 5000);
        });
    }
}