#!/usr/bin/bash

bucket_name="videotube"
sns_topic="video-transcoding-events"
sqs_queue="transcoding-queue"

localaws() {
  aws --endpoint-url=http://localhost:4566 "$@"
}

echo "[S3] Creating Bucket $bucket_name"
localaws s3 mb s3://$bucket_name >> /dev/null

if localaws s3 ls | grep -q "$bucket_name"; then
  echo "[S3] Bucket $bucket_name is created"
else
  echo "[S3] Failed to create bucket $bucket_name "
  exit 1
fi

echo "[SQS] Creating Queue $sqs_queue"
queue_url=$(localaws sqs create-queue --queue-name $sqs_queue | jq -r ".QueueUrl")
queue_arn=$(echo "$queue_url" | awk -F'[/:]' '{print "arn:aws:sqs:"$4":"$7":"$8}')

if localaws sqs list-queues | grep $sqs_queue >> /dev/null; then
   echo "[SQS] Queue $sns_topic is created"
else 
   echo "[SQS] Failed to create queue $sns_topic"
   exit 1
fi


echo "[SNS] Creating Topic $sns_topic"
topic_arn=$(localaws sns create-topic --name "$sns_topic" | jq -r '.TopicArn')

if localaws sns list-topics | grep $sns_topic >> /dev/null; then
   echo "[SNS] Topic $sns_topic is created"
else 
   echo "[SNS] Failed to create topic $sns_topic"
   exit 1
fi

echo "[SNS] Subscribing to SQS Events"
subscription_arn=$(localaws sns subscribe --topic-arn $topic_arn --protocol sqs --notification-endpoint $queue_arn | jq -r ".SubscriptionArn")

if localaws sns list-subscriptions | grep $subscription_arn >> /dev/null; then
   echo "[SNS] Subscribed to $topic_arn with $queue_arn"
else 
   echo "[SNS] Falied to subscribe $topic_arn with $queue_arn"
   exit 1
fi
