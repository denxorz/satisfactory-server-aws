import * as lambda_nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput, Duration, Expiration, Stack } from 'aws-cdk-lib';
import { Config } from './config';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AuthorizationType, Definition, GraphqlApi } from 'aws-cdk-lib/aws-appsync';

export const setupApi = (stack: Stack, server: Instance) => {
    const prefix = Config.prefix;

    const startServerLambda = new lambda_nodejs.NodejsFunction(stack, `${prefix}StartServerLambda`, {
        entry: './server-hosting/status/lambda.ts',
        description: "Manage game server",
        timeout: Duration.seconds(10),
        environment: { INSTANCE_ID: server.instanceId, bucketName: storage.bucketName },
        runtime: Runtime.NODEJS_22_X
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

    const domainName = Config.statusApiDomainName;
    const certificateArn = Config.statusApiCertificateArn;

    if (domainName && certificateArn) {
        const api = new GraphqlApi(
            stack,
            `${prefix}GraphqlApi`,
            {
                name: "SatisfactoryApi",
                definition: Definition.fromFile("./server-hosting/apischema.graphql"),
                authorizationConfig:
                {
                    defaultAuthorization:
                    {
                        authorizationType: AuthorizationType.API_KEY,
                        apiKeyConfig:
                        {
                            name: "CDK / Lambda 2025",
                            description: "CDK / Lambda",
                            expires: Expiration.after(Duration.days(365)),
                        }
                    }
                },
                domainName:
                {
                    domainName: domainName,
                    certificate: Certificate.fromCertificateArn(stack, `${prefix}StatusApiCertificate`, Config.statusApiCertificateArn),
                },
            });

        const lambdaDataSource = api.addLambdaDataSource(`${prefix}LambdaDataSource`, startServerLambda);
        lambdaDataSource.createResolver(`${prefix}StartResolver`, { typeName: "Mutation", fieldName: "start" });
        lambdaDataSource.createResolver(`${prefix}StatusResolver`, { typeName: "Query", fieldName: "status" });

        new CfnOutput(stack, "APIKey", { value: api.apiKey ?? "" });
    }
};