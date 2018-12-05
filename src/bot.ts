// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is the main entry point to handle incoming activities.

import { ActivityTypes, CardAction, CardFactory, ConversationState, MessageFactory, StatePropertyAccessor, TurnContext } from 'botbuilder';

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

            if (turnContext.activity.value && turnContext.activity.value.isDelete) {
                const messageId = turnContext.activity.replyToId;

                console.log(`Got request to delete activity: ${messageId}`);
                turnContext.deleteActivity(messageId);
            } else {

                const input = turnContext.activity.text;

                console.log(`Got query ${input}`);

                const giphyUrl = await this.giphyService.getRandomGifUrl(input);

                if (giphyUrl) {
                    const cardDeleteAction = {
                        channelData: {},
                        displayText: 'I clicked the delete button',
                        text: 'User just clicked the MessageBack button',
                        title: 'Delete Image',
                        type: 'messageBack',
                        value: {
                            isDelete: true,
                        },
                    };

                    const cardAttachment = CardFactory.heroCard(input, [giphyUrl], [cardDeleteAction]);
                    const reply = MessageFactory.attachment(cardAttachment);

                    // Send the gif to the user.
                    await turnContext.sendActivity(reply);
                } else {
                    await turnContext.sendActivity('Sorry, no gifs were found.');
                }
            }
        } else {
            console.log(`Got unexpected message type ${turnContext.activity.type}`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}
