import { EC2Client, StartInstancesCommand, DescribeInstanceStatusCommand } from "@aws-sdk/client-ec2";

const instanceId = process.env.INSTANCE_ID
const client = new EC2Client({ region: process.env.AWS_REGION });
const commandStart = new StartInstancesCommand({ InstanceIds: [instanceId!] });
const commandStatus = new DescribeInstanceStatusCommand({ InstanceIds: [instanceId!], IncludeAllInstances: true });

exports.handler = async function (event: any) {

  console.log("Received event:", event.path);

  if (event.path.startsWith('/start') || event.path == '/') {
    console.log("Attempting to start game server", instanceId);

    try {
      const res = await client.send(commandStart);
      const resStatus = await client.send(commandStatus)

      console.log(JSON.stringify(res));
      console.log(JSON.stringify(resStatus));

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/json" },
        body: JSON.stringify({
          status: res?.StartingInstances ? res?.StartingInstances[0]?.CurrentState?.Name ?? "??" : "??",
          previousStatus: res?.StartingInstances ? res?.StartingInstances[0]?.PreviousState?.Name ?? "??" : "??",
          detail: resStatus?.InstanceStatuses ? resStatus?.InstanceStatuses[0]?.InstanceStatus?.Details?.[0].Status ?? "??" : "??"
        })
      }
    }
    catch (err) {
      console.log(JSON.stringify(err));
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/json" },
        body: JSON.stringify({ message: "Failed to start satisfactory server", response: err })
      }
    }
  }

  if (event.path.startsWith('/status')) {
    try {
      const res = await client.send(commandStatus)
      console.log(JSON.stringify(res));

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/json" },
        body: JSON.stringify({
          status: res?.InstanceStatuses ? res?.InstanceStatuses[0]?.InstanceStatus?.Details ?? "??" : "??"
        })
      }
    }
    catch (err) {
      console.log(JSON.stringify(err));
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/json" },
        body: JSON.stringify({ message: "Failed to get Status:", response: JSON.stringify(err) })
      }
    };
  }

  console.log(`oops, path not found: ${event.path}`);

  return { statusCode: 404 };
}
