// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is the main entry point to handle incoming activities.

import { ActivityTypes, ConversationState, MessageFactory, StatePropertyAccessor, TurnContext } from 'botbuilder';

import { GiphyService } from './giphyService';

// Turn counter property
const TURN_COUNTER_PROPERTY: string = 'turnCounterProperty';

export class GifBot {

    private countProperty: StatePropertyAccessor<number>;

    private conversationState: ConversationState;

    private giphyService: GiphyService;

    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState: ConversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;

        this.giphyService = new GiphyService();
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    public async onTurn(turnContext: TurnContext) {
        // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (turnContext.activity.type === ActivityTypes.Message) {

            console.log(`Got query ${turnContext.activity.text}`);

            const giphyUrl = await this.giphyService.getRandomGifUrl(turnContext.activity.text);

            if (giphyUrl) {
                const reply = MessageFactory.attachment(this.getInternetAttachment(giphyUrl));
                // Send the gif to the user.
                await turnContext.sendActivity(reply);
            } else {
                await turnContext.sendActivity("Sorry, no gifs were found.");
            }

        } else {
            console.log(`Got unexpected message type ${turnContext.activity.type}`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }

    public getInternetAttachment(imageUrl: string) {
        return {
            name: 'YourGif',
            contentType: 'image/gif',
            contentUrl: imageUrl 
        }
    }
}
