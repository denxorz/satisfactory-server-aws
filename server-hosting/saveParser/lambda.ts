import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getStationsFromSave } from "./readSave";

const bucketName = process.env.bucketName
const lastProcessedFileInfoKey = 'saveDetails/lastFileParsed.txt';
const lastProcessedFileKey = 'saveDetails/details.txt';
const client = new S3Client({});

exports.handler = async function () {
  await processLastSave();
}

async function lastSaveFileName() {
  try {
    const savesListCommand = new ListObjectsV2Command({ Bucket: bucketName, Prefix: 'saves' });
    const saves = await client.send(savesListCommand);

    console.log('Saves total:', (saves.Contents ?? []).length);


    const sortedSaves = (saves.Contents ?? []).filter(d => !!d.LastModified).sort((a, b) =>
      (b.LastModified ?? new Date(8640000000000000)).getTime() - (a.LastModified ?? new Date(8640000000000000)).getTime());

    if (sortedSaves.length > 0) {
      return sortedSaves[0].Key;
    }
    return undefined;
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return undefined;
  };
}

async function lastSave() {
  try {
    const file = await lastSaveFileName();

    if (file) {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: file });
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

async function processLastSave() {
  try {
    let lastProcessedFile: (string | undefined) = undefined;
    try {
      const lastProcessedFileResult = await client.send(new GetObjectCommand({ Bucket: bucketName, Key: lastProcessedFileInfoKey }));
      lastProcessedFile = await lastProcessedFileResult.Body?.transformToString();
    }
    catch (err) {
      console.log("lastProcessedFile not found", JSON.stringify(err));
    };

    if (!lastProcessedFile) {
      const file = await lastSaveFileName();

      if (file !== lastProcessedFile) {
        const saveFileUrl = await lastSave();

        const saveFileResponse = await fetch(saveFileUrl.url ?? '');
        const buffer = Buffer.from(await saveFileResponse.arrayBuffer());

        const details = await getStationsFromSave(buffer);
        await client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: lastProcessedFileKey,
          Body: JSON.stringify({
            trainStations: Array.from(details.trainStations.values()).map(t => ({
              id: t.id.split("_").pop(),
              name: t.name,
              cargoType: t.platform?.inventory?.firstItemTypeId?.split("/")[5],
              isUnload: t.platform?.isUnloading ?? false,
              trains: t.trainsStopping.map(train => ({ id: train.id.split("_").pop() }))
            }))
          })
        }));

        await client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: lastProcessedFileInfoKey,
          Body: file
        }));
      }
    }
  }
  catch (err) {
    console.log("processLastSave error", JSON.stringify(err));
  };
}
