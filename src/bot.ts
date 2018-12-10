// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is the main entry point to handle incoming activities.
import { Activity, ActivityTypes, CardFactory, MessageFactory, TurnContext } from 'botbuilder';
import * as gifCard from '../resources/gifCard.json';
import * as helpCard from '../resources/helpCard.json';
import { GiphyAction } from './giphyAction';
import { GiphyService } from './giphyService';

export class GifBot {
    // regex used to remove all @tags from raw input (e.g. @Gifbot)
    private static readonly atTagRegex: RegExp = /<at>.*<\/at>/g;

    private giphyService: GiphyService;

    constructor() {
        this.giphyService = new GiphyService();
    }

    // Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
    public async onTurn(turnContext: TurnContext) {
        const message = turnContext.activity;

        // Handle Message activity type
        if (message.type === ActivityTypes.Message) {

            if (this.isCardAction(message)) {
                await this.handleCardAction(turnContext, message);
            } else {
                await this.handleNewRequest(turnContext, message);
            }

        } else {
            console.log(`Got unexpected message type ${turnContext.activity.type}`);
        }
    }

    private isCardAction(message: Activity): boolean {
        return message.replyToId && message.value;
    }

    private async handleCardAction(turnContext: TurnContext, message: Activity) {
        const replyValue = message.value;

        switch (replyValue.giphyAction) {
            case (GiphyAction.Delete):
                const replyToId = message.replyToId;
                console.log(`Got request to delete activity: ${replyToId}`);
                turnContext.deleteActivity(replyToId);
                break;
            default:
                console.log(`Got unknown message with message.value ${JSON.stringify(message.value)}`);
        }
    }

    private async handleNewRequest(turnContext: TurnContext, message: Activity) {
        const rawText = message.text;
        const cleanedText = this.cleanInputString(rawText);

        if ((!cleanedText) || cleanedText.toUpperCase() === 'help'.toUpperCase()) {
          await this.sendHelpResponse(turnContext);
        } else {
          await this.sendGiphyResponse(turnContext, message, cleanedText);
        }
    }

    private async sendHelpResponse(turnContext: TurnContext) {
      const cardAttachment = CardFactory.adaptiveCard(helpCard);
      const reply = MessageFactory.attachment(cardAttachment);
      await turnContext.sendActivity(reply);
    }

    private async sendGiphyResponse(turnContext: TurnContext, message: Activity, query: string) {
      const giphyUrl = await this.giphyService.getRandomGifUrl(query);

      if (giphyUrl) {
        const cardTitle: string = `Random GIF for **${query}** as requested by ${message.from.name}`;
        const reply = this.generateGiphyCardResponse(cardTitle, giphyUrl);
        await turnContext.sendActivity(reply);
      } else {
          await turnContext.sendActivity(MessageFactory.text(`Sorry, no GIF was found for "${query}".`));
      }
    }

    private generateGiphyCardResponse(cardTitle: string, giphyUrl: string): Partial<Activity> {
        gifCard.body[0].items[0].text = cardTitle;
        gifCard.body[0].items[1].url = giphyUrl;
        gifCard.actions[0].data.msteams.value = {
            giphyAction: GiphyAction.Delete,
        };

        const cardAttachment = CardFactory.adaptiveCard(gifCard);
        const reply = MessageFactory.attachment(cardAttachment);

        return reply;
    }

    private cleanInputString(rawText: string): string {
        const result = this.removeAtTags(rawText).trim();
        return result;
    }

    private removeAtTags(text: string): string {
        const result = text.replace(GifBot.atTagRegex, '');
        return result;
    }
}
