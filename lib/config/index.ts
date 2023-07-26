interface StackConfig {
  AppName: string;
  AppSlug: string;
  AWSAccountNumber: string;
  AWSRegion: string;
  DomainName: string;
  HostedZoneId: string;
  GoogleOAuthClientId: string;
  GoogleOAuthSecretArn: string;
}
const config: StackConfig = {
  AppName: 'AppName',
  AppSlug: 'appslug',
  AWSAccountNumber: 'AWSAccountNumber',
  AWSRegion: 'AWSRegion',
  DomainName: 'DomainName',
  HostedZoneId: 'HostedZoneId',
  GoogleOAuthClientId: 'GoogleOAuthClientId',
  GoogleOAuthSecretArn: 'GoogleOAuthSecretArn',
};
export default config;
