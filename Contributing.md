# Contributing

GifBot is an open source project and contributions are welcome!

## How to submit contributions

All contributions should be thoroughly tested and submitted through a pull request. The pull request title should reflect the work accomplished, and the description should provide more context on what, why, and how. Bonus points of the pull request is set up following [these](https://chris.beams.io/posts/git-commit/) git guidelines.

## Instructions to run GifBot locally

- Download this GitHub repo
- Create a file called .env in the root of the project and add botFilePath, botFileSecret, giphyApiKey, and kuduPassword to it

  - If you have access to our Azure Resource Group you can find these values in the Azure App Service application settings
  - (more likely) If you do not have access to our Resource Group you will need to create your own Azure Web Bot, grab it's values and then use this repo as the source code. You will also need to get your own giphyApi key
  - Your .env file should look like this

    ```bash
    botFilePath=<copy value from App settings>
    botFileSecret=<copy value from App settings>
    giphyApiKey=<your giphy API key>
    kuduPassword=<your kudu password>
    ```

- Create the `.bot` file. Either download the `.bot` file from our Azure resource if you have access, or use the one from your created bot above
  - To get it from our Azure resource click on the App Service. Then under `Development Tools` click `Advanced Tools` (this is a Kudu link). Then click `Debug Console` and navigate to `/site/wwwroot/` and the .Bot file has been uploaded there
- Run `npm install` in the root of the bot project
- Finally run `npm run build` and then `npm start`

### Testing the bot using Bot Framework Emulator

[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator from [here](https://aka.ms/botframework-emulator)

Not all of our functionality can be tested through the Bot Framework Emulator. Currently the delete functionality can only be tested in teams because it uses a `messageBack` action that is not supported by the emulator. If you want to help us out and add that to the emulator that would be awesome :-).

#### Connect to bot using Bot Framework Emulator v4

- Launch the Bot Framework Emulator
- File -> Open bot and navigate to the bot project folder
- Select `<your-bot-name>.bot` file

### Test bot in Microsoft Teams

To upload and test your custom build into Microsoft Teams follow [these](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/apps/apps-upload) instructions.
