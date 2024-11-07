import ReverseProxy from "../reverse_proxy/reverse_proxy";
import AlwaysBlockRule from "./rules/AlwaysBlockRule";
import HelloWorldRules from "./rules/HelloWorldRules";
import LoggingRules from "./rules/LoggingRules";

export default class FirewallFactory {
    private config: any;
    private readonly reverse_proxy: ReverseProxy;

    constructor(reverse_proxy: ReverseProxy, config: any) {
        this.config = config;
        this.reverse_proxy = reverse_proxy;
    }
    
    public build(): ReverseProxy  {
        if(!this.config.plugins) {
            return this.reverse_proxy
        }

        for(const plugin of this.config.plugins) {
            switch(plugin.module) {
                case "AlwaysBlock":
                    this.reverse_proxy.setupFirewallRules(new AlwaysBlockRule())
                    break;
                case "LoggingRules":
                    this.reverse_proxy.setupFirewallRules(new LoggingRules(plugin.message))
                    break;
                case "HelloWorldRules":
                    this.reverse_proxy.setupFirewallRules(new HelloWorldRules())
                    break;
            }
        }

        return this.reverse_proxy
    }
}