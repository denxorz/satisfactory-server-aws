import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration, Stack } from 'aws-cdk-lib';
import { Config } from './config';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { grantReadWriteToStorage } from './storage';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

export const setupSaveFileParser = (stack: Stack, api: GraphqlApi | null, server: Instance, storage: IBucket) => {
    const prefix = Config.prefix;

    const f = new lambda.Function(stack, `${prefix}SaveFileParserLambda`, {
        functionName: 'SaveFileParserLambda',
        description: 'Process save file',
        timeout: Duration.seconds(45),
        environment: { INSTANCE_ID: server.instanceId, bucketName: storage.bucketName },
        runtime: lambda.Runtime.PROVIDED_AL2023,
        code: lambda.Code.fromCustomCommand(
            "./server-hosting/saveParser/bin/function.zip",
            ["dotnet lambda package -pl ./server-hosting/saveParser -o ./server-hosting/saveParser/bin/function.zip"],
            { commandOptions: { shell: true } }),
        handler: 'bootstrap',
        memorySize: 2048,
    });

    grantReadWriteToStorage(f.role!, storage);

    new Rule(stack, `${prefix}SaveFileParserScheduleRule`, {
        schedule: Schedule.cron({ minute: '0', hour: '6' }),
        targets: [new LambdaFunction(f)]
    });

    // if (api) {
    //     const lambdaDataSource = api.addLambdaDataSource(`${prefix}SaveFileParserLambdaDataSource`, lambda);
    // }
};