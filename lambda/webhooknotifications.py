# This is the python script used by the lambda that performs the webhook post to endpoints like slack and teams
import json
import logging
import os
from ast import literal_eval

import boto3
import urllib3

http = urllib3.PoolManager()
logging.getLogger().setLevel(logging.INFO)

def get_webhook_url(secret, sns_message):
    if 'SECRET_REGION' in os.environ:
        region_name = os.environ.get('SECRET_REGION', 'us-east-1')

    # Create a Secret Manager Client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretmanager',
        region_name=region_name
    )
    get_secret_value_response = client.get_secret_value(
        SecretId=secret
    )

    webhook_url = json.loads(get_secret_value_response['SecretString'])
    logging.info(f'These are the dictionaries of urls {webhook_url}')
    if sns_message['status'] == 'ready':
        if 'success_url' in webhook_url:
            return webhook_url['success_workflow_url']
        else:
            logging.info("No url for success workflow prresent in the secret so can't notify to your webhook endpoint")
            pass
    elif sns_message['status'] == 'error':
        if 'failure_url' in webhook_url:
            return webhook_url['failure_workflow_url']
        else:
            logging.info("No url for failure workflow url present in the secret so can't notify to your webhook endpoint")
            pass
    else:
        logging.info(
            'SNS sent a message with a payload format that the webhook workflow might not support, check the payload in cloudwatch'
        )
        return None

def lambda_handler(event, context):
    sns_message = json.loads(event['Records'][0]['Sns']['Message'])
    logging.info(f'This is the message from SNS: {sns_message}')

    encoded_msg = json.dumps(sns_message)
    logging.info(f'THis is the encoded msg for posting: {encoded_msg}')

    if 'WEBHOOK_SECRET' in os.environ:
        webhooksecrets = os.environ.get('WEBHOOK_SECRET')
        secret_list = literal_eval(webhooksecrets)
        logging.info(f"These are the list of secrets for the lambda: {secret_list}")
        for secret in secret_list:
            url = get_webhook_url(secret, sns_message)
            resp = http.request('POST', url, body=encoded_msg, headers={'Content-Type': 'application/json'})
            logging.info({
                "message": sns_message,
                "status_code": resp.status,
                "response": resp.data
                })