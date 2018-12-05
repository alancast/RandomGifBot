// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required packages
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';

import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import { BotConfiguration, IEndpointService } from 'botframework-config';
import { GifBot } from './bot';

// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
const ENV_FILE: string = path.join(__dirname, '..', '.env');
dotenv.config({ path: ENV_FILE });

// Get the .bot file path
const BOT_FILE: string = path.join(__dirname, '..', process.env.botFilePath || '');
let botConfig: BotConfiguration;
try {
  // Read bot configuration from .bot file.
  botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {

  console.error(
    `\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`,
  );
  console.error(`\n - You can find the botFilePath and botFileSecret in the Azure App Service application settings.`);
  console.error(
    `\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.`,
  );

  process.exit();
}

// For local development configuration as defined in .bot file
const DEV_ENVIRONMENT: string = 'development';

// Define name of the endpoint configuration section from the .bot file
const BOT_CONFIGURATION: string = process.env.NODE_ENV || DEV_ENVIRONMENT;

// Get bot endpoint configuration by service name
// Bot configuration as defined in .bot file
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION) as IEndpointService;

// Create bot adapter.
const adapter = new BotFrameworkAdapter({
  appId: endpointConfig.appId || process.env.microsoftAppID,
  appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword,
  channelService: process.env.ChannelService,
  openIdMetadata: process.env.BotOpenIdMetadata,
});

// Catch-all for any unhandled errors in your bot.
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  // This check writes out errors to console log .vs. app insights.
  console.error(`\n [onTurnError]: ${error}`);
  // Send a message to the user
  await context.sendActivity(`Oops. Something went wrong!`);
};

// Create the main dialog.
const bot = new GifBot();

// Create HTTP server
const server: restify.Server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
  console.log(`\nTo talk to your bot, open .bot file in the Emulator`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req: restify.Request, res: restify.Response) => {
  adapter.processActivity(req, res, async (context: TurnContext) => {
    // route to main dialog.
    await bot.onTurn(context);
  });
});
