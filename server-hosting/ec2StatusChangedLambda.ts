import { Duration, Stack } from 'aws-cdk-lib';
import { GraphqlApi, MappingTemplate, PrimaryKey, Values } from 'aws-cdk-lib/aws-appsync';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Config } from './config';

export const setupEc2StatusChangeHandling = (stack: Stack, api: GraphqlApi | null, server: Instance) => {
  if (!api) {
    return;
  }

  const prefix = Config.prefix;
  const bus = EventBus.fromEventBusName(stack, 'default-bus', 'default');

  const rule = new Rule(stack, 'Ec2StatusChangeRule', {
    eventBus: bus,      
    eventPattern: {
      source: ['aws.ec2'],
      detailType: ['EC2 Instance State-change Notification'],
    },
  });

  const lambda = new NodejsFunction(stack, 'Ec2StatusChangeLambda', {
    handler: 'index.handler',
    runtime: Runtime.NODEJS_22_X,
    environment: { 
      INSTANCE_ID: server.instanceId, 
      GraphQLAPIURL: api.graphqlUrl,
      GraphQLAPIKey: api.apiKey ?? "??"	,
    },
    timeout: Duration.seconds(5),
    entry: './server-hosting/status/statusEc2ChangedLambda.ts',
  });

  const statusTable = new Table(
      stack,
      `${prefix}StatusTable`,            
      {
          billingMode: BillingMode.PAY_PER_REQUEST,
          partitionKey: 
          {
              name: "id",
              type: AttributeType.STRING,
          },
      });

  const statusTableDataSource = api.addDynamoDbDataSource(`${prefix}StatusDynamoDataSource`, statusTable);
  statusTableDataSource.createResolver(
      `${prefix}StatusQueryResolver`,
      { 
          typeName: "Query", 
          fieldName: "status", 
          requestMappingTemplate: MappingTemplate.dynamoDbGetItem("id", "id"), 
          responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
      });

    statusTableDataSource.createResolver(
      `${prefix}StatusMutationResolver`,
      { 
          typeName: "Mutation", 
          fieldName: "updateStatus", 
          requestMappingTemplate: MappingTemplate.dynamoDbPutItem(PrimaryKey.partition("id").is("input.id"), Values.projecting("input")),
          responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
      });

  api?.grantMutation(lambda, 'updateServerStatus');

  rule.addTarget(new LambdaFunction(lambda));
};