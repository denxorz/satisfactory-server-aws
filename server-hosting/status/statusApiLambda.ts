import { DescribeInstanceStatusCommand, EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { probe } from '@djwoodz/satisfactory-dedicated-server-lightweight-query-probe';

const instanceId = process.env.INSTANCE_ID
const bucketName = process.env.bucketName
const ec2Client = new EC2Client({ region: process.env.AWS_REGION });
const commandStart = new StartInstancesCommand({ InstanceIds: [instanceId!] });
const commandStatus = new DescribeInstanceStatusCommand({ InstanceIds: [instanceId!], IncludeAllInstances: true });
const s3Client = new S3Client({});
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });

exports.handler = async function (event: any) {
  const fieldName = event.info.fieldName;

  if (fieldName == 'start') {
    return await start();
  }

  if (fieldName == 'status') {
    return await status();
  }

  if (fieldName == 'lastSave') {
    return await lastSave();
  }

  if (fieldName == 'lastLog') {
    return await lastLog();
  }

  if (fieldName == 'saveDetails') {
    return await readLastSave();
  }

  if (fieldName == 'saveDetailsBuildInfo') {
    return await getSaveDetailsBuildInfo();
  }

  if (fieldName == 'gameServerProbe') {
    const host = event.arguments?.host ?? ''
    const port = event.arguments?.port ?? 7777
    return await gameServerProbe(host, port);
  }

  if (fieldName == 'rebuildSaveDetails') {
    return await rebuildSaveDetails();
  }

  console.log(`oops, fieldName not found: ${fieldName}`);
  return { statusCode: 404 };
}

async function start() {
  console.log("Attempting to start game server", instanceId);

  try {
    const res = await ec2Client.send(commandStart);
    const resStatus = await ec2Client.send(commandStatus)

    console.log(JSON.stringify(res));
    console.log(JSON.stringify(resStatus));

    return {
      status: res?.StartingInstances ? res?.StartingInstances[0]?.CurrentState?.Name ?? "??" : "??",
      previousStatus: res?.StartingInstances ? res?.StartingInstances[0]?.PreviousState?.Name ?? "??" : "??",
      detail: resStatus?.InstanceStatuses ? resStatus?.InstanceStatuses[0]?.InstanceStatus?.Details?.[0].Status ?? "??" : "??"
    }
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to start satisfactory server " + JSON.stringify(err)
    };
  }
}

async function status() {
  try {
    const res = await ec2Client.send(commandStatus)
    console.log(JSON.stringify(res));

    return {
      status: res?.InstanceStatuses ? res?.InstanceStatuses[0]?.InstanceState?.Name ?? "??" : "??",
      detail: res?.InstanceStatuses ? res?.InstanceStatuses[0]?.InstanceStatus?.Details?.[0]?.Status : "??",
    };
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to get status " + JSON.stringify(err)
    };
  };
}

async function lastSave() {
  try {
    const savesListCommand = new ListObjectsV2Command({ Bucket: bucketName, Prefix: 'saves' });
    const saves = await s3Client.send(savesListCommand);

    console.log('Saves total:', (saves.Contents ?? []).length);


    const sortedSaves = (saves.Contents ?? []).filter(d => !!d.LastModified).sort((a, b) => (b.LastModified ?? new Date(8640000000000000)).getTime() - (a.LastModified ?? new Date(8640000000000000)).getTime());

    if (sortedSaves.length > 0) {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: sortedSaves[0].Key });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

      return { url };
    }
    return { url: '' };
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to get lastSave " + JSON.stringify(err)
    }
  };
}

async function lastLog() {
  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: 'saved/Logs/FactoryGame.log' });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return { url };
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to get lastLog " + JSON.stringify(err)
    }
  };
}

async function getSaveDetails() {
  const details = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: 'saveDetails/details.txt' }));
  return JSON.parse(await details.Body?.transformToString() ?? '{}');
}

async function getSaveDetailsBuildInfo() {
  try {
    const saveDetailsBuildInfo = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: 'saveDetails/saveDetailsBuildInfo.txt' }));
    const info = JSON.parse(await saveDetailsBuildInfo.Body?.transformToString() ?? '{}');
    
    return {
      fileName: info.fileName,
      fileDate: info.fileDate ? new Date(info.fileDate).toISOString() : null,
      parsedDate: info.parsedDate ? new Date(info.parsedDate).toISOString() : null
    };
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      fileName: null,
      fileDate: null,
      parsedDate: null
    }
  };
}

async function readLastSave() {
  try {
    return await getSaveDetails();
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to readLastSave " + JSON.stringify(err)
    }
  };
}

async function gameServerProbe(host: string, port: number) {
  try {
    console.log(`Probing ${host}:${port}`);
    
    const timeoutInMilliseconds = 1000;
    const result = await probe(host, port, timeoutInMilliseconds);

    const serializableResult = {
      ...result,
      clientData: result.clientData.toString(),
      serverFlags: result.serverFlags.toString(),
    };
    console.log(`Result: ${JSON.stringify(serializableResult)}`);

    return {
      success: true,
      ...serializableResult,
    };
  } catch (error) {
    console.error('Probe error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      serverState: null,
      serverVersion: null,
      serverName: null,
    };
  }
}

async function rebuildSaveDetails() {
  try {
    console.log("Triggering save file parser lambda with force rebuild parameter");
    
    const invokeCommand = new InvokeCommand({
      FunctionName: 'SaveFileParserLambda',
      InvocationType: 'Event',
      Payload: JSON.stringify({ forceRebuild: true })
    });
    
    await lambdaClient.send(invokeCommand);
    
    return { status: "ok" };
  } catch (error) {
    console.error('Rebuild error:', error);
    
    return { status: "Failed" };
  }
}
