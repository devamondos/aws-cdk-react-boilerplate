/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

import AppConfig from '../lib/config';

interface ApiGWStackProps extends cdk.StackProps {
  webBucket: s3.Bucket;
  lambdas: { [key: string]: lambda.Function };
}

export default class CdkApiGWStack extends cdk.Stack {
  private api: apigw.RestApi;

  private webBucket: s3.Bucket;

  private lambdas: { [key: string]: lambda.Function };

  constructor(scope: cdk.App, id: string, props: ApiGWStackProps) {
    super(scope, id, props);

    this.webBucket = props.webBucket;
    this.lambdas = props.lambdas;

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        zoneName: AppConfig.DomainName,
        hostedZoneId: AppConfig.HostedZoneId,
      },
    );
    const certificate = new acm.Certificate(this, 'DomainCertificate', {
      domainName: AppConfig.DomainName,
      validation: acm.CertificateValidation.fromDns(zone),
    });
    this.api = new apigw.RestApi(this, 'ApiGW', {
      restApiName: AppConfig.AppName,
      binaryMediaTypes: ['*/*'],
      minimumCompressionSize: 0,
      domainName: {
        domainName: AppConfig.DomainName,
        certificate,
      },
    });
    if (this.api.domainName) {
      new route53.ARecord(this, 'ApiGWRecord', {
        zone,
        target: route53.RecordTarget.fromAlias(
          new targets.ApiGateway(this.api),
        ),
      });
    } else {
      throw Error('API has no domain name');
    }

    const executeRole = new iam.Role(this, 'ApiGWs3AssumeRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      roleName: 'APIGatewayS3IntegrationRole',
    });

    executeRole.addToPolicy(
      new iam.PolicyStatement({
        resources: [this.webBucket.bucketArn],
        actions: ['s3:Get'],
      }),
    );

    this.api.root.addMethod(
      'GET',
      new apigw.HttpIntegration(this.webBucket.bucketWebsiteUrl, {
        proxy: true,
        httpMethod: 'GET',
      }),
    );
    this.api.root.addResource('{item}').addMethod(
      'GET',
      new apigw.AwsIntegration({
        service: 's3',
        path: `${this.webBucket.bucketName}/{item}`,
        region: 'eu-west-2',
        integrationHttpMethod: 'GET',
        options: {
          requestParameters: {
            'integration.request.path.item': 'method.request.path.item',
            'integration.request.header.Content-Disposition':
              'method.request.header.Content-Disposition',
            'integration.request.header.Content-Type':
              'method.request.header.Content-Type',
          },
          credentialsRole: executeRole,
          integrationResponses: [
            {
              statusCode: '200',
              selectionPattern: '200',
              responseParameters: {
                'method.response.header.Content-Disposition':
                  'integration.response.header.Content-Disposition',
                'method.response.header.Content-Type':
                  'integration.response.header.Content-Type',
              },
            },
          ],
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Disposition': true,
              'method.response.header.Content-Type': true,
            },
          },
        ],
        requestParameters: {
          'method.request.path.item': true,
          'method.request.header.Content-Disposition': false,
          'method.request.header.Content-Type': false,
        },
      },
    );

    const apiResource = this.api.root.addResource('api');
    apiResource
      .addResource('config')
      .addMethod(
        'GET',
        new apigw.LambdaIntegration(this.lambdas.getConfig, {
          integrationResponses: [{ statusCode: '200' }],
        }),
      )
      .addMethodResponse({ statusCode: '200' });
    apiResource
      .addResource('authorise')
      .addMethod(
        'GET',
        new apigw.LambdaIntegration(this.lambdas.authorise, {
          integrationResponses: [{ statusCode: '200' }],
        }),
      )
      .addMethodResponse({ statusCode: '200' });
  }
}
