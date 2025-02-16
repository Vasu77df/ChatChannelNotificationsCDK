# Welcome to your CDK TypeScript Construct Library project for sending notifcations via Slack Webhooks

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`ChatChannelNotificationsCdk`)
which contains a lambda that subscribes to SNS topic that processes the message and send an update to a slack webhook 

The construct defines an interface (`ChatChannelNotificationsCdkProps`) to configure the visibility timeout of the queue.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
