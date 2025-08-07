import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { setupApi } from './api';
import { Config } from './config';
import { setupEc2StatusChangeHandling } from './ec2StatusChangedLambda';
import { setupNetwork } from './network';
import { setupSaveFileParser } from './saveFileParserLambda';
import { setupServer } from './server';
import { setupStatusPage } from './status/statusPageStaticWebpage';
import { setupStatusLambda } from './statusLambda';
import { grantReadWriteToStorage, setupStorage } from './storage';

export class ServerHostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = setupNetwork(this);
    const storage = setupStorage(this);
    const server = setupServer(this, network, storage);
    grantReadWriteToStorage(server.role, storage);

    if (Config.restartApi && Config.restartApi === true) {
      const api = setupApi(this);
      setupEc2StatusChangeHandling(this, api, server);
      setupStatusLambda(this, api, server, storage);
      setupSaveFileParser(this, api, server, storage);
    }

    if (Config.statusPageDomainName && Config.statusPageCertificateArn) {
      setupStatusPage(this);
    }
  }
}


