import ReverseProxyManager from "./proxy/reverse_proxy/reverse_proxy_manager";
import ReverseProxy from "./proxy/reverse_proxy/reverse_proxy";

function main() {
    const reverse_proxy = new ReverseProxy({
        http_port: 8000,
        https_port: 443,
        hostname: 'lilboissivi.com',
        path: '/'
    })
    ReverseProxyManager.getInstance().addReverseProxy(reverse_proxy);

    // Run
    ReverseProxyManager.getInstance().start()
}

main();