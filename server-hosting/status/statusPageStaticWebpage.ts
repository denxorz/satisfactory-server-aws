import { CfnOutput, RemovalPolicy, Stack } from "aws-cdk-lib";
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Config } from "../config";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export const setupStatusPage = (stack: Stack) => {
    const prefix = Config.prefix;
    const domainName = Config.statusPageDomainName;
    const certificateArn = Config.statusPageCertificateArn;

    const bucket = new s3.Bucket(
        stack,
        `${prefix}StatusPageBucket`,
        {
            bucketName: domainName,
            accessControl: s3.BucketAccessControl.PRIVATE,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

    new CfnOutput(stack, `${prefix}StatusPageBucketUrl`, { value: bucket.bucketWebsiteUrl });

    new BucketDeployment(
        stack,
        `${prefix}StatusPageBucketDeployment`,
        {
            destinationBucket: bucket,
            sources: [Source.asset("statuspage/dist")]
        });

    const cdn = new Distribution(
        stack,
        `${prefix}StatusPageDistribution`,
        {
            domainNames: [domainName],
            certificate: Certificate.fromCertificateArn(stack, `${prefix}StatusPageCertificate`, certificateArn),
            defaultRootObject: "index.html",
            defaultBehavior: { origin: S3BucketOrigin.withOriginAccessControl(bucket) },
        });

    new CfnOutput(stack, `${prefix}StatusPageDomainName`, { value: cdn.distributionDomainName });
};