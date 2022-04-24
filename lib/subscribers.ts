// This is the file where you can add subscribers, you can checkout all the command examples below

export interface Subscriber {
    readonly endpoint: string
    readonly service?: string
    readonly channelName?: string
    readonly protocol: string
}

export const subscribers: Subscriber[] = [
  {
    endpoint: 'xyz@gmail.com',
    protocol: 'email'
  },
  {
    endpoint: 'channel/your-awesome-channel-name/workspace',
    service: 'slack',
    channelName: 'your-awesome-channel-name',
    protocol: 'webhook'
  },
  {
    endpoint: 'aws_account_id', // the AWS Account of where the resource is located
    protocol: 'sqs'
  },
  {
    endpoint: 'aws_account_id', // the AWS Account of where the resource is located
    protocol: 'lambda'
  }

]
