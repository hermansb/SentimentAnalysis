# Bluemix workshop - Simple Sentiment Analysis application

![Ambivalent Smiley](http://simplesentimentanalysis.mybluemix.net/images/content.png "Ambivalent Smiley")

You can do lots of cool things when you develop apps on the cloud. We've created this short workshop to let you try working with an app on the cloud.

## Try out a currently running version of the app
You can <a href="http://simplesentimentanalysis.mybluemix.net/" target="_blank">play with an instance of the application</a> running on Bluemix. You can analyze the sentiment of any topic you're interested in such as your favorite celebrity, TV show, movie, or a topic in the news.

Technical explanation: The application takes a keyword or hashtag, connects to Twitter to get a stream of matching tweets,
and runs those tweets through a sentiment-analysis module to produce a sentiment score.

## Create your own version of the app

1. Deploy this application to Bluemix by clicking the button: <a href="https://bluemix.net/deploy?repository=https://github.com/hermansb/SentimentAnalysis.git" target="_blank"><img src="http://bluemix.net/deploy/button.png" alt="Bluemix button" /></a>

2. `Log in` using the credentials we provided you for your Bluemix account.

3. Click `DEPLOY` after the `ORGANIZATION` and `SPACE` finish loading. What is happening: A project is created under your account and the code is copied (cloned) to the project. A pipeline is configured for your code to travel through, and finally, that pipeline pushes the code to a running instance of the application on Bluemix.
![Deploy To Bluemix page 1](./readme_images/d2bm.png)

4. Click `VIEW YOUR APP` to see a live, running version of your app!
![Deploy To Bluemix page 2](./readme_images/d2bm_2.png)

5. Let's make sure that your Sentiment Analysis app is working. Type a topic to monitor, and then click Go. Note: It may take a while for the tweets to start being analyzed.

## Customize your app

1. Now that you've checked that your Sentiment Analysis app is working, let's go back to the Deploy this application to Bluemix page to customize the app.

2.	Click the `Edit Code` button and wait for the code editor to load in your browser.

3. Once it is loaded, use the file navigator on the left side of the window to click `app.js`, opening the file.
![Orion page](./readme_images/orion_1.png)

4. Change lines 150 and 169 to include your names. For example, `Helen and Colleen's Twitter Sentiment Analysis` inside the <title> and </title> tags.

5. From the Web IDE menu, which is on the left side of the window, click the Git ![Git icon](./readme_images/git.png) icon.

6. In the Working Directory Changes section, which is in the upper-right corner of the window, make sure that the `app.js` file is selected. Type a commit message that explains what you changed. For example, `Added names to title`. Click `Commit` and then click `Push`.
![Orion page](./readme_images/orion_2.png)

7.	In the upper-right corner of the window, click `BUILD & DEPLOY` to watch the pipeline deploy the change to your live Bluemix app. ![Pipeline button](./readme_images/pipeline_1.png)
![Pipeline page](./readme_images/pipeline_2.png)

8.	After the deployment completes, in the `LAST EXECUTION RESULT` section, click the `URL` for your app. You should see your name in the title of the tab that opens. ![My name](./readme_images/tab_title.png)

Congratulations! You completed the workshop. Take a well-deserved break or continue making changes to the app or read the appendices below for future development.

## Appendix I: Checking the logs of your running application on Bluemix
- You have deployed your app to Bluemix using the `Cloud Foundry` runtime. In
order to check the best way would be to [download the cloud foundry command line interface here](https://github.com/cloudfoundry/cli/releases).
- Once you have installed the command-line interface, you can open a
Windows Command Prompt (if on windows) or Terminal (if on Mac OS / Linux) and
run the following commands
  - `cf login -a https://api.ng.bluemix.net -u <Bluemix UserId> -p <Bluemix Password>`
  - `cf apps` to get a list of apps in your organization and space
  - `cf logs --recent <appNameFromAboveList>` - will show you the recent logs for your app running on Bluemix.

## Appendix II: Using your own Twitter keys
In order to make this as easy as possible during the short amount of time we
have for the workshop, we have provided the keys to use already as part of the
source code. This can cause the sentiment analysis to slow down as Twitter
rate limits the calls you can make to its service based on your API keys.
Since there are a few other groups using the same set of API keys as you are
during this workshop, that will cause slowdowns.

If you have your own Twitter account with a verified phone number (via a text
  message) you can enter your own Twitter keys into your running application as
  below. Note if you plan to work on this application beyond the workshop you
  must do so, as the API keys we have provided in the source will be revoked
  afterwards, for security purposes.

Technical Note: if you want your code and twitter account to be secure, the
twitter API keys you use should not be checked into the code but rather set as
environment variables so that anyone can see your code without compromising
the security of your account and app.

### Get your Twitter keys and plug them into the app

In order to run the sample, you'll need to paste in your own API keys from Twitter.

* Go to <a href="https://apps.twitter.com/apps/" target="_blank">Twitter Developer Page here</a>, create a new app, generate an API key and an access token.
* Edit the app.js file, replace the consumer_key and consumer_secret with your application key and secret.
* Replace the access_token_key and access_token_secret with your access token and access token secret from Twitter.

If you don't replace these, the app will fail to connect to Twitter, and should log an authentication error.

### To get your own Twitter Application Keys

To get your own Twitter application keys for this project or any others first go to the <a href="https://apps.twitter.com/app/" target="_blank">Twitter Developer Page</a> and click on __Create New App__

![Create New App](public/images/CreateApp.png "Create App")

Then fill in the details for the app as follows.  Since you might not know your URL yet you can put in a placeholder.  Then Scroll down to _Yes I Agree_ disclaimer and press the __Create Your Twitter Application__.

![Application Details](public/images/ApplicationDetails.png "Application Details")

In the Application Management page, choose the API Keys _tab_ to generate your own keys.

![Application Management](public/images/ApplicationManagement.png "Application Management")

Originally you will have no application keys, just the API keys.  Press the __Create My Access Token__ button and accept the prompt that appears.  It might take a minute to do this so you might have to refresh the page.  Once complete there are the API keys at the top of the page and the Access Token keys at the bottom.

Use these in the __app.js__ section replacing the default values.

### Licensed under the EPL (see [license.txt](license.txt))
