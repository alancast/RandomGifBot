import axios, { AxiosError, AxiosResponse } from 'axios';

export class GiphyService {
  private static readonly giphyBaseUri: string = 'https://api.giphy.com/v1/gifs/search?api_key=';
  private static readonly giphyLimit: number = 9;
  private static readonly giphyRating: string = 'PG';

  private static randomGifIndex(arraySize: number) {
    return Math.floor(Math.random() * arraySize);
  }

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
      const result = (await axios.get(requestUri).catch(this.handleError)) as AxiosResponse;
      const gifs: any[] = result.data.data;

      if (gifs.length > 0) {
        const index = GiphyService.randomGifIndex(gifs.length);
        console.log(gifs[index].images.original.url);
        gifUrl = gifs[index].images.original.url;
      }
    } catch (e) {
      this.handleError(e);
    }

    return gifUrl;
  }

  private createRequestUri(query: string) {
    const uri: string =
      `${GiphyService.giphyBaseUri}${this.giphyApiKey}` +
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
