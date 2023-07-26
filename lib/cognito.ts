/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

import AppConfig from '../lib/config';

export default class CdkCognitoStack extends cdk.Stack {
  public userPool: cognito.UserPool;

  public userPoolClient: cognito.UserPoolClient;

  public userPoolClientSecret: secretsmanager.Secret;

  public signInURL: string;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'CognitoPool', {
      userPoolName: AppConfig.AppName,
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        email: {
          required: true,
          mutable: true,
        },
      },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const secret = secretsmanager.Secret.fromSecretAttributes(
      this,
      'CognitoClientSecret',
      {
        secretCompleteArn: AppConfig.GoogleOAuthSecretArn,
      },
    ).secretValue;

    const googleIDP = new cognito.UserPoolIdentityProviderGoogle(
      this,
      'GoogleIdentityProvider',
      {
        clientId: AppConfig.GoogleOAuthClientId,
        clientSecretValue: secret,
        userPool: this.userPool,
        scopes: ['openid', 'profile', 'email'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          fullname: cognito.ProviderAttribute.GOOGLE_NAME,
        },
      },
    );

    const domain = this.userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: AppConfig.AppSlug,
      },
    });

    this.userPoolClient = new cognito.UserPoolClient(
      this,
      'CognitoPoolClient',
      {
        userPool: this.userPool,
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.GOOGLE,
        ],
        oAuth: {
          flows: {
            implicitCodeGrant: false,
            authorizationCodeGrant: true,
          },
          callbackUrls: [`https://${AppConfig.DomainName}`],
        },
        accessTokenValidity: cdk.Duration.days(1),
        refreshTokenValidity: cdk.Duration.days(365),
      },
    );
    this.userPoolClientSecret = new secretsmanager.Secret(
      this,
      'ClientSecret',
      {
        secretStringValue: this.userPoolClient.userPoolClientSecret,
      },
    );

    this.userPoolClient.node.addDependency(googleIDP);

    this.signInURL = domain.signInUrl(this.userPoolClient, {
      redirectUri: `https://${AppConfig.DomainName}`,
      signInPath: '/oauth2/authorize',
    });
  }
}
