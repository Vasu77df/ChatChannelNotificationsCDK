# This is the python script used by the lambda that performs the webhook post to endpoints like slack and teams
import json
import logging
import os

import boto3
import urllib3

http = urllib3.PoolManager()
logging.getLogger().setLevel(logging.INFO)


def get_webhook_url(secret):
    if "SECRET_REGION" in os.environ:
        region_name = os.environ.get("SECRET_REGION", "us-east-1")

    # Create a Secret Manager Client
    session = boto3.session.Session()
    client = session.client(service_name="secretmanager", region_name=region_name)
    get_secret_value_response = client.get_secret_value(SecretId=secret)

    webhook_urls_dict = json.loads(get_secret_value_response["SecretString"])
    logging.info(f"These are the dictionaries of urls {webhook_urls_dict}")
    urls = [value for value in webhook_urls_dict.values()]
    logging.info(f"These are the urls: {urls}")

    return urls


def lambda_handler(event, context):
    sns_message = json.loads(event["Records"][0]["Sns"]["Message"])
    logging.info(f"This is the message from SNS: {sns_message}")

    encoded_msg = json.dumps(sns_message)
    logging.info(f"THis is the encoded msg for posting: {encoded_msg}")

    if "ENDPOINTS_SECRET" in os.environ:
        webhooksecrets = os.environ.get("ENDPOINTS_SECRET")
        post_url_list = get_webhook_url(webhooksecrets)
        logging.info(f"These are the list of secrets for the lambda: {post_url_list}")
        for url in post_url_list:
            resp = http.request(
                "POST",
                url,
                body=encoded_msg,
                headers={"Content-Type": "application/json"},
            )
            logging.info(
                {
                    "message": sns_message,
                    "status_code": resp.status,
                    "response": resp.data,
                }
            )
