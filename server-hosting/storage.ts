import { Stack } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Config } from './config';
import { IRole } from 'aws-cdk-lib/aws-iam';

export const setupStorage = (stack: Stack) : s3.IBucket => {
    const prefix = Config.prefix;

    const findOrCreateBucket = (bucketName: string): s3.IBucket => {
        // if bucket already exists lookup and use the bucket
        if (bucketName) {
            return s3.Bucket.fromBucketName(stack, `${prefix}SavesBucket`, bucketName);
            // if bucket does not exist create a new bucket
            // autogenerate name to reduce possibility of conflict
        } else {
            return new s3.Bucket(stack, `${prefix}SavesBucket`);
        }
    }

    return findOrCreateBucket(Config.bucketName);
};

export const grantReadToStorage = (role: IRole, bucket: s3.IBucket) => {
    bucket.grantRead(role);
}

export const grantReadWriteToStorage = (role: IRole, bucket: s3.IBucket) => {
    bucket.grantReadWrite(role);
}
