# Carousell-Scraper

This branch contains the version carousell-scraper used to deploy on AWS Lambda. 

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements
---
* AWS CLI already configureds with Administrator permission (You can create a user as using IAM but you will need to add in sufficient requirements)
* AWS S3 bucket and Lambda function created
* [NodeJS 16.x installed](https://nodejs.org/en/download/)

## Installation Instructions
---
1. [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and login.

2. [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [install the AWS Serverless Application Model CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) on your local machine.

3. Create a new directory and navigate to that directory in a terminal.

4. Clone this repo:
```
git clone -b aws-lambda --single-branch git@github.com:isaacl16/carousell_scraper.git
```
5. Install the pacakages
```
npm install
```
6. Open package.json and under scripts edit in your AWS S3 bucket and Lambda function
```
"uploadConfig": "aws s3 cp config.json s3://<bucket>",
"sendToLambda": "npm run zip && aws s3 cp function.zip s3://<bucket> && rm function.zip && aws lambda update-function-code --function-name <function-name> --s3-bucket carousell-scraper-bucket --s3-key function.zip"
```
6. Deploy to AWS
```
npm run sendToLambda
```
## Explanation
---
Since this application will need a headless browser for us to be able to scrape the carousell tokens, we will need have a form of chromium that is able to be used on AWS Lambda. I was able to find a binary version of chromium by [@sparticuz/chromium](https://github.com/Sparticuz/chromium) for serverless platforms. This just means that we have a version of chromium packaged as a node module. 

For the deployment, the application is first compressed into a zipped archive which is then uploaded to AWS S3 buckets. After which the AWS Lambda function is updated using the newly uploaded zip. 

The main question here is why go about such a long process for deployment?
AWS Lambda has a file limit size of (50MB) and because we have to use a binary version of chromium for this instance, the file size exceeds the file limit. Thus, the reason for the long work around.

## Addition 
---
A rule can be setup to run the application on a schedule using EventBridge. This is a relatively simple process thus I will not be explaining it here. Follow this [tutorial](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-run-lambda-schedule.html) instead.