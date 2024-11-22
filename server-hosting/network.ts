import { Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Config } from './config';

export const setupNetwork = (stack: Stack) => {
    const prefix = Config.prefix;

    const lookUpOrDefaultVpc = (vpcId: string): ec2.IVpc => {
        // lookup vpc if given
        if (vpcId) {
            return ec2.Vpc.fromLookup(stack, `${prefix}Vpc`, {
                vpcId
            })

            // use default vpc otherwise
        } else {
            return ec2.Vpc.fromLookup(stack, `${prefix}Vpc`, {
                isDefault: true
            })
        }
    }

    const publicOrLookupSubnet = (subnetId: string, availabilityZone: string): ec2.SubnetSelection => {
        // if subnet id is given select it
        if (subnetId && availabilityZone) {
            return {
                subnets: [
                    ec2.Subnet.fromSubnetAttributes(stack, `${prefix}ServerSubnet`, {
                        availabilityZone,
                        subnetId
                    })
                ]
            };

            // else use any available public subnet
        } else {
            return { subnetType: ec2.SubnetType.PUBLIC };
        }
    }

    const vpc = lookUpOrDefaultVpc(Config.vpcId);
    const vpcSubnets = publicOrLookupSubnet(Config.subnetId, Config.availabilityZone);

    // configure security group to allow ingress access to game ports
    const securityGroup = new ec2.SecurityGroup(stack, `${prefix}ServerSecurityGroup`, {
        vpc,
        description: "Allow Satisfactory client to connect to server",
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(7777), "Game port udp");
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(7777), "Game port tcp");
    securityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.udp(7777), "Game port udp Ipv6");
    securityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(7777), "Game port tcp Ipv6");

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(15000), "Beacon port");
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(15777), "Query port");

    return {
        vpc,
        vpcSubnets,
        securityGroup
    };
};
