import { Construct } from 'constructs'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { IRole } from 'aws-cdk-lib/aws-iam'
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda'
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ChatChannelNotificationsCdkProps {
  // Define construct properties here
  triggerServiceRole: IRole
}

export class ChatChannelNotificationsCdk extends Construct {
  constructor (scope: Construct, id: string, props: ChatChannelNotificationsCdkProps) {
    super(scope, id)
    const topic = new Topic(this, 'ChatChannelNotificationsTopic', {
      topicName: 'ChatChannelNotificationsTopic',
      displayName: 'Topic to relay notifications from your service to your chat workspace'
    })

    topic.grantPublish(props.triggerServiceRole)

    // ------- Chat Channel Notification Lambda --------
    const webhookNotiLambda = new Function(this, 'ChatChannelNotificationsLambda', {
      functionName: 'ChatChannelNotificationsLambda',
      runtime: Runtime.PYTHON_3_9,
      code: Code.fromAsset('lambda'),
      handler: 'webhooknotification.lambda_handler'
    })

    topic.addSubscription(new LambdaSubscription(webhookNotiLambda))

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'ChatChannelNotificationsCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
