import { Stack } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Config } from './config';
import { IRole } from 'aws-cdk-lib/aws-iam';

export const setupStorage = (stack: Stack) => {
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

    const savesBucket = findOrCreateBucket(Config.bucketName);
    return savesBucket;
};

export const grantReadWriteToStorage = (role: IRole, bucket: s3.IBucket) => {
    bucket.grantReadWrite(role);
}
