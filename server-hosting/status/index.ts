import { EC2Client, StartInstancesCommand, DescribeInstanceStatusCommand } from "@aws-sdk/client-ec2";

const instanceId = process.env.INSTANCE_ID
const client = new EC2Client({ region: process.env.AWS_REGION });
const commandStart = new StartInstancesCommand({ InstanceIds: [instanceId!] });
const commandStatus = new DescribeInstanceStatusCommand({ InstanceIds: [instanceId!], IncludeAllInstances: true });

exports.handler = async function (event: any) {
  const fieldName = event.info.fieldName;

  if (fieldName == 'start') {
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
      }
    }
  }

  if (fieldName == 'status') {
    try {
      const res = await client.send(commandStatus)
      console.log(JSON.stringify(res));

      return {
        status: res?.InstanceStatuses ? res?.InstanceStatuses[0]?.InstanceState?.Name ?? "??" : "??",
        detail: res?.InstanceStatuses ? res?.InstanceStatuses[0]?.InstanceStatus?.Details : "??",
        previousStatus: JSON.stringify(res)
      }
    }
    catch (err) {
      console.log(JSON.stringify(err));
      return {
        status: "Failed to get status " + JSON.stringify(err)
      }
    };
  }

  console.log(`oops, fieldName not found: ${fieldName}`);

  return { statusCode: 404 };
}
