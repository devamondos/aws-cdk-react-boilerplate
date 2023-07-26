/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import path from 'path';

interface LambdaStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  userPoolClientSecret: secretsmanager.Secret;
  userPoolSignInURL: string;
}

export default class CdkLambdaStack extends cdk.Stack {
  public readonly lambdas: { [key: string]: lambda.Function } = {};

  constructor(scope: cdk.App, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.getConfig(
      props.userPool.userPoolId,
      props.userPoolClient.userPoolClientId,
      props.userPoolSignInURL,
    );
    this.authorise(
      props.userPoolClient.userPoolClientId,
      props.userPoolClientSecret,
    );
  }

  private getConfig(
    userPoolId: string,
    userPoolClientId: string,
    userPoolSignInURL: string,
  ) {
    const getConfig = new lambda.Function(this, 'GetConfig', {
      functionName: 'get-config',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index',
      code: lambda.Code.fromAsset(
        path.join(__dirname, 'lambdas', 'get-config'),
      ),
      environment: {
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
        USER_POOL_SIGN_IN_URL: userPoolSignInURL,
      },
    });
    this.lambdas.getConfig = getConfig;
  }

  private authorise(
    userPoolClientId: string,
    userPoolClientSecret: secretsmanager.Secret,
  ) {
    const authorise = new lambda.Function(this, 'Authorise', {
      functionName: 'authorise',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas', 'authorise')),
      environment: {
        USER_POOL_CLIENT_ID: userPoolClientId,
        USER_POOL_CLIENT_SECRET_ARN: userPoolClientSecret.secretArn,
      },
    });
    userPoolClientSecret.grantRead(authorise);
    this.lambdas.authorise = authorise;
  }
}
