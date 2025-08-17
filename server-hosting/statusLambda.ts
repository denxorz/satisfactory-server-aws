import { Duration, Stack } from 'aws-cdk-lib';
import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Config } from './config';
import { grantReadToStorage } from './storage';

export const setupStatusLambda = (stack: Stack, api: GraphqlApi | null, server: Instance, storage: IBucket) => {
    const prefix = Config.prefix;

    const startServerLambda = new lambda_nodejs.NodejsFunction(stack, `${prefix}StartServerLambda`, {
        entry: './server-hosting/status/statusApiLambda.ts',
        description: "Manage game server",
        timeout: Duration.seconds(10),
        environment: { INSTANCE_ID: server.instanceId, bucketName: storage.bucketName },
        runtime: Runtime.NODEJS_22_X,
    })
    grantReadToStorage(startServerLambda.role!, storage);

    startServerLambda.addToRolePolicy(new iam.PolicyStatement({
        actions: [
            'ec2:StartInstances',
        ],
        resources: [
            `arn:aws:ec2:*:${Config.account}:instance/${server.instanceId}`,
        ]
    }))

    startServerLambda.addToRolePolicy(new iam.PolicyStatement({
        actions: [
            'ec2:DescribeInstances',
            'ec2:DescribeInstanceStatus',
        ],
        resources: [
            `*`,
        ]
    }))

    startServerLambda.addToRolePolicy(new iam.PolicyStatement({
        actions: [
            'lambda:InvokeFunction',
        ],
        resources: [
            `arn:aws:lambda:*:${Config.account}:function:SaveFileParserLambda`,
        ]
    }))

    if (api) {
        const lambdaDataSource = api.addLambdaDataSource(`${prefix}StatusLambdaDataSource`, startServerLambda);
        lambdaDataSource.createResolver(`${prefix}StartResolver`, { typeName: "Mutation", fieldName: "start" });
        lambdaDataSource.createResolver(`${prefix}RebuildSaveDetailsResolver`, { typeName: "Mutation", fieldName: "rebuildSaveDetails" });
        lambdaDataSource.createResolver(`${prefix}LastSaveResolver`, { typeName: "Query", fieldName: "lastSave" });
        lambdaDataSource.createResolver(`${prefix}LastLogResolver`, { typeName: "Query", fieldName: "lastLog" });
        lambdaDataSource.createResolver(`${prefix}SaveDetailsResolver`, { typeName: "Query", fieldName: "saveDetails" });
        lambdaDataSource.createResolver(`${prefix}SaveDetailsBuildInfoResolver`, { typeName: "Query", fieldName: "saveDetailsBuildInfo" });
        lambdaDataSource.createResolver(`${prefix}GameServerProbeResolver`, { typeName: "Query", fieldName: "gameServerProbe" });
    }
};