import { readFileSync } from "fs";
import { EC2Client, StartInstancesCommand, DescribeInstanceStatusCommand } from "@aws-sdk/client-ec2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getStationsFromSave } from "./readSave";

const instanceId = process.env.INSTANCE_ID
const bucketName = process.env.bucketName
const client = new EC2Client({ region: process.env.AWS_REGION });
const commandStart = new StartInstancesCommand({ InstanceIds: [instanceId!] });
const commandStatus = new DescribeInstanceStatusCommand({ InstanceIds: [instanceId!], IncludeAllInstances: true });

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

  console.log(`oops, fieldName not found: ${fieldName}`);
  return { statusCode: 404 };
}

async function start() {
  console.log("Attempting to start game server", instanceId);

  try {
    const res = await client.send(commandStart);
    const resStatus = await client.send(commandStatus)

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
    const res = await client.send(commandStatus)
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
    const client = new S3Client({});

    const savesListCommand = new ListObjectsV2Command({ Bucket: bucketName, Prefix: 'saves' });
    const saves = await client.send(savesListCommand);

    console.log('Saves total:', (saves.Contents ?? []).length);


    const sortedSaves = (saves.Contents ?? []).filter(d => !!d.LastModified).sort((a, b) => (b.LastModified ?? new Date(8640000000000000)).getTime() - (a.LastModified ?? new Date(8640000000000000)).getTime());

    if (sortedSaves.length > 0) {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: sortedSaves[0].Key });
      const url = await getSignedUrl(client, command, { expiresIn: 600 });

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
    const client = new S3Client({});

    const command = new GetObjectCommand({ Bucket: bucketName, Key: 'saved/Logs/FactoryGame.log' });
    const url = await getSignedUrl(client, command, { expiresIn: 600 });

    return { url };
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to get lastLog " + JSON.stringify(err)
    }
  };
}

async function readLastSave() {
  try {
    const saveFileUrl = await lastSave();

    const saveFileResponse = await fetch(saveFileUrl.url ?? '');
    const buffer = Buffer.from(await saveFileResponse.arrayBuffer());

    const details = await getStationsFromSave(buffer);

    return {
      trainStations: Array.from(details.trainStations.values()).map(t => ({
        id: t.id.split("_").pop(),
        name: t.name,
        cargoType: t.platform?.inventory?.firstItemTypeId?.split("/")[5],
        isUnload: t.platform?.isUnloading ?? false,
        trains: t.trainsStopping.map(train => ({id: train.id.split("_").pop()}))
      }))
    };
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return {
      status: "Failed to readLastSave " + JSON.stringify(err)
    }
  };
}
