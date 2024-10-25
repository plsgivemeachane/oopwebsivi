export interface URL_DATA {
    protocol: string
    hostname: string
    port: string
    path?: string
}

/**
 * The URLUtils class provides methods to extract URL data from a given URL string.
 */
export default class URLUtils {

    /**
     * Extracts the URL data from a given URL string.
     * @param url - The URL string.
     * @returns An object containing the URL data.  
     */
    static extractURL(url: string): URL_DATA {
        const protocol = url.startsWith('https://') ? 'https:' : 'http:';
        const hostname = url.replace('http://', '').replace('https://', '').split('/')[0].split(':')[0];
        const port = url.replace('http://', '').replace('https://', '').split('/')[0].split(':')[1];
        const path = url.replace('http://', '').replace('https://', '').replace(url.replace('http://', '').replace('https://', '').split('/')[0], '')
        return {
            protocol, hostname, port, path
        }
    }
}