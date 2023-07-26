/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';

import AppConfig from '../lib/config';

import path from 'path';

export default class CdkS3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: AppConfig.AppSlug + '-ui',
      websiteIndexDocument: 'index.html',
      autoDeleteObjects: true,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    new s3Deployment.BucketDeployment(this, 'BucketDeployment', {
      destinationBucket: bucket,
      sources: [
        s3Deployment.Source.asset(path.resolve(__dirname, './../dist')),
      ],
    });

    this.bucket = bucket;
  }
}
