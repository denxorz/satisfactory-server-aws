import { EC2Client, StartInstancesCommand, DescribeInstanceStatusCommand } from "@aws-sdk/client-ec2";

const instanceId = process.env.INSTANCE_ID
const client = new EC2Client({ region: process.env.AWS_REGION });
const command = new StartInstancesCommand({ InstanceIds: [instanceId!] });

exports.handler = function (event: any) {

  console.log("Received event:", event.path);

  if (event.path.startsWith('/start')) {
    console.log("Attempting to start game server", instanceId);

    return client.send(command)
      .then((res) => {
        console.log(JSON.stringify(res));
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/json" },
          body: JSON.stringify({ message: "Started satisfactory server", response: JSON.stringify(res) })
        }
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/json" },
          body: JSON.stringify({ message: "Failed to start satisfactory server", response: JSON.stringify(err) })
        }
      });
  }

  if (event.path.startsWith('/status')) {
    return client.send(new DescribeInstanceStatusCommand({ InstanceIds: [instanceId!], IncludeAllInstances: true }))
      .then((res) => {
        console.log(JSON.stringify(res));
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/json" },
          body: JSON.stringify({ message: "Started satisfactory server", response: JSON.stringify(res) })
        }
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/json" },
          body: JSON.stringify({ message: "Failed to start satisfactory server", response: JSON.stringify(err) })
        }
      });
  }

  console.log(`oops, path not found: ${event.path}`);
  return {
    statusCode: 404
  };
}
