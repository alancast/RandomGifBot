import { CardAction } from 'botbuilder';
import { GiphyAction } from './giphyAction';

export class GiphyCardAction {

    public static deleteCardAction: CardAction = {
            channelData: {},
            title: 'Delete',
            type: 'messageBack',
            value: {
                giphyAction: GiphyAction.Delete,
            },
        };
}
