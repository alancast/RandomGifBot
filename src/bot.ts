// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is the main entry point to handle incoming activities.

import { ActivityTypes, CardFactory, ConversationState, MessageFactory, TurnContext } from 'botbuilder';

import { GiphyService } from './giphyService';

export class GifBot {
  private conversationState: ConversationState;
  private giphyService: GiphyService;

  constructor(conversationState: ConversationState) {
    this.conversationState = conversationState;
    this.giphyService = new GiphyService();
  }

  // Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
  public async onTurn(turnContext: TurnContext) {
    // Handle Message activity type
    if (turnContext.activity.type === ActivityTypes.Message) {
      const message = turnContext.activity;
      const text = message.text;
      console.log(`Got query ${text}`);
      const giphyUrl = await this.giphyService.getRandomGifUrl(text);

      if (giphyUrl) {
        const cardTitle: string = `Random GIF for "${text}" as requested by ${message.from.name}`;
        const cardAttachment = CardFactory.heroCard(cardTitle, [giphyUrl], ['Delete']);
        const reply = MessageFactory.attachment(cardAttachment);

        // Send the gif to the user.
        await turnContext.sendActivity(reply);
      } else {
        // Handle all other activity types
        await turnContext.sendActivity(`Sorry, no GIF was found for "${text}".`);
      }
    } else {
      console.log(`Got unexpected message type ${turnContext.activity.type}`);
    }

    // Save state changes
    await this.conversationState.saveChanges(turnContext);
  }
}
