import { Kiribi } from 'kiribi';
import { KiribiPerformer } from 'kiribi/performer';
import { client } from 'kiribi/client';
import { rest } from 'kiribi/rest';

export default class extends Kiribi {
	client = client;
	rest = rest;
}

// Jobの定義
export class MyPerformer extends KiribiPerformer {
	async perform(payload: any) {
		// Do something with the payload
		console.log('perform', payload);
	}
}
