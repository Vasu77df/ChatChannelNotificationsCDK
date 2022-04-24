import * as cdk from 'aws-cdk-lib'
import { Stack } from 'aws-cdk-lib'
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { ChatChannelNotificationsService } from './chatchannelnotificatons'

export class TestStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const stack = Stack.of(this)

        const serviceRole = new Role(this, 'ExampleRole', {
            assumedBy: new ServicePrincipal('lamdbda.amazon.com'),
            roleName: 'TriggerServiceRole',
            managedPolicies: [new ManagedPolicy(this, 'servicepolicy',
                {
                    statements: [new PolicyStatement(
                        {
                            effect: Effect.ALLOW,
                            actions: ['s3:PutObject'],
                            resources: ['arn:aws:s3:::empty-bucket']
                        })]
                })]
        })

        const slackNotifications = new ChatChannelNotificationsService(this, 'SlackNotifications', {
            triggerServiceRole: serviceRole,
            secretName: 'channel/my-cool-channel/slack',
            secretRegion: stack.region,
            kmsAlias: 'endpoints_secret_key'
        })
    }
}
