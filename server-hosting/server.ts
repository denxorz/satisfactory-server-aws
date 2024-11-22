import { Stack } from "aws-cdk-lib";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3_assets from 'aws-cdk-lib/aws-s3-assets';
import { Config } from './config';
import { IBucket } from "aws-cdk-lib/aws-s3";

export const setupServer = (
    stack: Stack,
    network: { vpc: ec2.IVpc; vpcSubnets: ec2.SubnetSelection; securityGroup: ec2.SecurityGroup; },
    storage: IBucket
) => {

    const prefix = Config.prefix;

    const server = new ec2.Instance(stack, `${prefix}Server`, {
        // 2 vCPU, 8 GB RAM should be enough for most factories
        instanceType: new ec2.InstanceType("m5a.large"),
        // get exact ami from parameter exported by canonical
        // https://discourse.ubuntu.com/t/finding-ubuntu-images-with-the-aws-ssm-parameter-store/15507
        machineImage: ec2.MachineImage.fromSsmParameter("/aws/service/canonical/ubuntu/server/20.04/stable/current/amd64/hvm/ebs-gp2/ami-id"),
        // storage for steam, satisfactory and save files
        blockDevices: [
            {
                deviceName: "/dev/sda1",
                volume: ec2.BlockDeviceVolume.ebs(15),
            }
        ],
        // server needs a public ip to allow connections
        vpcSubnets: network.vpcSubnets,
        userDataCausesReplacement: true,
        vpc: network.vpc,
        securityGroup: network.securityGroup,
    })

    // Add Base SSM Permissions, so we can use AWS Session Manager to connect to our server, rather than external SSH.
    server.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    setupStartupSequence(stack, server, storage);

    return server;
};

const setupStartupSequence = (stack: Stack, server: ec2.Instance, storage: IBucket) => {
    // add aws cli
    // needed to download install script asset and
    // perform backups to s3
    server.userData.addCommands('sudo apt-get install unzip -y')
    server.userData.addCommands('curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install')

    // package startup script and grant read access to server
    const startupScript = new s3_assets.Asset(stack, `${Config.prefix}InstallAsset`, {
        path: './server-hosting/scripts/install.sh'
    });
    startupScript.grantRead(server.role);

    // download and execute startup script
    // with save bucket name as argument
    const localPath = server.userData.addS3DownloadCommand({
        bucket: startupScript.bucket,
        bucketKey: startupScript.s3ObjectKey,
    });
    server.userData.addExecuteFileCommand({
        filePath: localPath,
        arguments: `${storage.bucketName} ${Config.useExperimentalBuild}`
    });
};