import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Duration, Stack } from 'aws-cdk-lib';
import { Config } from './config';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export const setupApi = (stack: Stack, server: Instance) => {
    const startServerLambda = new lambda_nodejs.NodejsFunction(stack, `${Config.prefix}StartServerLambda`, {
        entry: './server-hosting/lambda/index.ts',
        description: "Manage game server",
        timeout: Duration.seconds(10),
        environment: { INSTANCE_ID: server.instanceId },
        runtime: Runtime.NODEJS_LATEST
    })

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

    new apigw.LambdaRestApi(stack, `${Config.prefix}StartServerApi`, {
        handler: startServerLambda,
        description: "Trigger lambda function to start server",
    })
};