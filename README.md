
# StreamingLiveChat
API for handling websocket chat connections (chat.streaminglive.church)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).


### Dev Setup Instructions
 * **Dev setup instruction for Local Hosted** 
   * Copy part of dotenv.sample.txt file that says Locally Hosted and JWT_SECRET_KEY to .env
   * Run *npm install*
   * Run *npm run dev*  

 * **Dev setup instruction for AWS Local** 
  * Install AWS CLI, you can refer here (https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  * Configure AWS CLI (key and secret of a testing account are required)
  * Copy part of dotenv.sample.txt file that says AWS Hosted , AWS Local and JWT_SECRET_KEY Hosted to .env
  * Run *npm install*
  * Run *serverless install dynamodb*
  * Run *serverless offline start*  
