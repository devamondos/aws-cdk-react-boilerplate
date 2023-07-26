/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import CdkApiGWStack from '../lib/apigw';
import CdkCognitoStack from '../lib/cognito';
import CdkLambdaStack from '../lib/lambda';
import CdkS3Stack from '../lib/s3';

import AppConfig from '../lib/config';

const app = new cdk.App();
const env = {
  account: AppConfig.AWSAccountNumber,
  region: AppConfig.AWSRegion,
};

const s3Stack = new CdkS3Stack(app, `${AppConfig.AppName}-S3`, {
  stackName: `${AppConfig.AppName}-S3`,
  env,
});
const cognito = new CdkCognitoStack(app, `${AppConfig.AppName}-Cognito`, {
  stackName: `${AppConfig.AppName}-Cognito`,
  env,
});
const lambdasStack = new CdkLambdaStack(app, `${AppConfig.AppName}-Lambda`, {
  stackName: `${AppConfig.AppName}-Lambda`,
  env,
  userPool: cognito.userPool,
  userPoolClient: cognito.userPoolClient,
  userPoolClientSecret: cognito.userPoolClientSecret,
  userPoolSignInURL: cognito.signInURL,
});
new CdkApiGWStack(app, `${AppConfig.AppName}-ApiGW`, {
  stackName: `${AppConfig.AppName}-ApiGW`,
  env,
  webBucket: s3Stack.bucket,
  lambdas: lambdasStack.lambdas,
});
