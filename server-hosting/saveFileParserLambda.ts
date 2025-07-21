import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration, Stack } from 'aws-cdk-lib';
import { Config } from './config';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { grantReadWriteToStorage } from './storage';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

export const setupSaveFileParser = (stack: Stack, api: GraphqlApi | null, server: Instance, storage: IBucket) => {
    const prefix = Config.prefix;

    const lambda = new lambda_nodejs.NodejsFunction(stack, `${prefix}SaveFileParserLambda`, {
        entry: './server-hosting/saveParser/lambda.ts',
        description: "Process save file",
        timeout: Duration.seconds(45),
        environment: { INSTANCE_ID: server.instanceId, bucketName: storage.bucketName },
        runtime: Runtime.NODEJS_22_X,
        memorySize: 2048
    })
    grantReadWriteToStorage(lambda.role!, storage);

    new Rule(stack, `${prefix}SaveFileParserScheduleRule`, {
        schedule: Schedule.cron({ minute: '0', hour: '6' }),
        targets: [new LambdaFunction(lambda)]
    });

    // if (api) {
    //     const lambdaDataSource = api.addLambdaDataSource(`${prefix}SaveFileParserLambdaDataSource`, lambda);
    // }
};