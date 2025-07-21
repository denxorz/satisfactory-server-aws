import { CfnOutput, Duration, Expiration, Stack } from 'aws-cdk-lib';
import { Config } from './config';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AuthorizationType, Definition, GraphqlApi } from 'aws-cdk-lib/aws-appsync';

export const setupApi = (stack: Stack) => {
    const prefix = Config.prefix;

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

        new CfnOutput(stack, "APIKey", { value: api.apiKey ?? "" });

        return api;
    }

    return null;
};