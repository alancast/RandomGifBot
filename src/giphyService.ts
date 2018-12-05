import axios, {AxiosError, AxiosResponse} from 'axios';

export class GiphyService {

    private static readonly giphyBaseUri: string = 'https://api.giphy.com/v1/gifs/search?api_key=';

    private static readonly giphyLimit: number = 1;

    private static readonly giphyRating: string = 'g';

    private giphyApiKey: string = process.env.giphyApiKey;

    constructor(giphyApiKey?: string) {
        if (giphyApiKey) {
            this.giphyApiKey = giphyApiKey;
        }
    }

    public async getRandomGifUrl(query: string) {
        const requestUri = this.createRequestUri(query);

        let gifUrl: string;

        try {
            const result = await axios.get(requestUri).catch(this.handleError) as AxiosResponse;
            console.log(result.data.data[0].images.original.url);
            gifUrl = result.data.data[0].images.original.url;
        } catch (e) {
            this.handleError(e);
        }

        return gifUrl;
    }

    private createRequestUri(query: string) {
        const uri: string = `${GiphyService.giphyBaseUri}${this.giphyApiKey}` +
            `&limit=${GiphyService.giphyLimit}&rating=${GiphyService.giphyRating}&q=${query}`;

        return uri;
    }

    private handleError(error: AxiosError) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else {
            console.log(error.message);
          }
    }
}
