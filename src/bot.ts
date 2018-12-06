// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is the main entry point to handle incoming activities.
import { Activity, ActivityTypes, CardFactory, MessageFactory, TurnContext } from 'botbuilder';
import * as card from '../resources/card.json';
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
                console.log(`Got unknown message with message.value ${JSON.stringify(message)}`);
        }
    }

    private async handleNewRequest(turnContext: TurnContext, message: Activity) {
        const rawText = message.text;
        console.log(`Got query ${rawText}`);

        const cleanedText = this.cleanInputString(rawText);
        const giphyUrl = await this.giphyService.getRandomGifUrl(cleanedText);

        if (giphyUrl) {
            const cardTitle: string = `Random GIF for "${cleanedText}" as requested by ${message.from.name}`;
            const reply = this.generateGiphyCardResponse(cardTitle, giphyUrl);
            await turnContext.sendActivity(reply);
        } else {
            await turnContext.sendActivity(MessageFactory.text(`Sorry, no GIF was found for "${cleanedText}".`));
        }
    }

    private generateGiphyCardResponse(cardTitle: string, giphyUrl: string): Partial<Activity> {
        card.body[0].items[0].text = cardTitle;
        card.body[0].items[1].url = giphyUrl;
        card.actions[0].data.msteams.value = {
            giphyAction: GiphyAction.Delete,
        };

        const cardAttachment = CardFactory.adaptiveCard(card);

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
