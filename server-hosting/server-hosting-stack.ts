import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Config } from './config';
import { setupServer } from './server';
import { setupNetwork } from './network';
import { grantReadWriteToStorage, setupStorage } from './storage';
import { setupApi } from './api';
import { setupStatusPage } from './status/statusPageStaticWebpage';

export class ServerHostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = setupNetwork(this);
    const storage = setupStorage(this);
    const server = setupServer(this, network, storage);
    grantReadWriteToStorage(server.role, storage);

    if (Config.restartApi && Config.restartApi === true) {
      setupApi(this, server, storage);
    }

    if (Config.statusPageDomainName && Config.statusPageCertificateArn) {
      setupStatusPage(this);
    }
  }
}
