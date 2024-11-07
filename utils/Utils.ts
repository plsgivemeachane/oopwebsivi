import { Snowflake } from 'nodejs-snowflake'

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
}