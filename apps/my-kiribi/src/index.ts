import { Kiribi } from 'kiribi';
import { KiribiPerformer } from 'kiribi/performer';

export default class extends Kiribi {}

export class MyPerformer extends KiribiPerformer {
	async perform(payload: any) {
		// Do something with the payload
		console.log('perform', payload);
	}
}
