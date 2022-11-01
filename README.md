# Carousell-Scraper-Lambda
---
This branch contains the version [carousell-scraper](https://github.com/isaacl16/carousell_scraper) used to deploy on AWS Lambda. 

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements
---
* AWS CLI already configured with Administrator permission (You can create a user as using IAM but you will need to add in sufficient requirements)
* AWS S3 bucket and Lambda function created
* [NodeJS 16.x installed](https://nodejs.org/en/download/)

## Installation Instructions
---
1. Clone this repo:
```
git clone -b aws-lambda --single-branch git@github.com:isaacl16/carousell_scraper.git.
```
2. Install the pacakages.
```
npm install
```
3. Open package.json and under scripts edit in your AWS S3 bucket and Lambda function.
```
"uploadConfig": "aws s3 cp config.json s3://<bucket>",
"sendToLambda": "npm run zip && aws s3 cp function.zip s3://<bucket> && rm function.zip && aws lambda update-function-code --function-name <function-name> --s3-bucket carousell-scraper-bucket --s3-key function.zip"
```
4. Deploy to AWS.
```
npm run sendToLambda
```
## Explanation
---
Since this application will need a headless browser for us to be able to scrape the carousell tokens, we will need have a form of chromium that is able to be used on Lambda. I was able to find a binary version of chromium by [@sparticuz/chromium](https://github.com/Sparticuz/chromium) for serverless platforms. This just means that we have a version of chromium packaged as a node module. 

For the deployment, the application is first compressed into a zipped archive which is then uploaded to S3. After which the Lambda function is updated using the newly uploaded zip. 

The question here is why go about such a long process for deployment?
Lambda has a file limit size of 50MB and because we have to use a binary version of chromium, the file size exceeds the file limit. Thus, the workaround is to instead upload the zip to S3 and update the Lambda function from there since the 50 MB limit doesn’t apply when you load the function from S3. 

## Addition 
---
A rule can be setup to run the application on a schedule using `AWS EventBridge`. This is a relatively simple process thus I will not be explaining it here. Follow this tutorial [here](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-run-lambda-schedule.html) instead.
