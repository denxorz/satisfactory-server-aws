const instanceId = process.env.INSTANCE_ID
const apiUrl = process.env.GraphQLAPIURL
const apiKey = process.env.GraphQLAPIKey

exports.handler = async function (event: any) {
  const eventInstanceId = event.detail['instance-id'];

  if (eventInstanceId != instanceId) {
    console.log(`${eventInstanceId} != ${instanceId}, skipping`);
    return;
  }

  const status = event.detail.state;
  const detail = event.detail;
  const previousStatus = detail.previousStatus;

  try {
    console.log('event:', JSON.stringify(event));
    const mutationData = await callMutation(status, previousStatus, detail);
    console.log('[INFO] mutationData', mutationData);
  } catch (error) {
      console.log('[ERROR] Error',error);
  }
}

const callMutation = async (status: string, previousStatus: string, detail: string) => {
  try {
    const query = `
    mutation UpdateStatus($input: StatusInput) {
      updateStatus(input: $input) {
        id
        status
        previousStatus
        detail
      }
    }`;

  const variables = {
    input: {
        id: 'last',
        status,
        previousStatus,
        detail,
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'x-api-key': apiKey ?? "??",
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    };

    const request = new Request(apiUrl ?? "??", options);

    
      const response = await fetch(request);
      const body: any = await response.json();
      if (body && typeof body === 'object' && 'errors' in body && body.errors) {
        console.log('[ERROR] Error', body.errors);
      }
      console.log('[INFO] body', body);
    } catch (error) {
      console.log('[ERROR] Error-catch', error);
    }
}
