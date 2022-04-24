import { Construct } from 'constructs'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { IRole } from 'aws-cdk-lib/aws-iam'
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda'
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Key } from 'aws-cdk-lib/aws-kms'

export interface ChatChannelNotificationsCdkProps {
  // Define construct properties here
  triggerServiceRole: IRole
  secretName: string
  secretRegion: string
  kmsAlias: string
}

export class ChatChannelNotificationsCdk extends Construct {
  constructor(scope: Construct, id: string, props: ChatChannelNotificationsCdkProps) {
    super(scope, id)
    // SNS Topic for your service role to publish messages too.
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

    webhookNotiLambda.addEnvironment('ENDPOINTS_SECRET', props.secretName)
    webhookNotiLambda.addEnvironment('SECRET_REGION', props.secretRegion)

    // granting lambda permissions to read the secret
    const endpointsSecret = Secret.fromSecretNameV2(
      this,
      'Channel-Endpoints-Secret',
      props.secretName
    )
    endpointsSecret.grantRead(webhookNotiLambda)

    // granting lambda the permission to use KMS key to decrypt the secret
    const endpointsSecretKMSKey = Key.fromLookup(
      this,
      'Endpoints-Secret-Key',
      {
        aliasName: props.kmsAlias
      }
    )
    endpointsSecretKMSKey.grantDecrypt(webhookNotiLambda)
  }
}
