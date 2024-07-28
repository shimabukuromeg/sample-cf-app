import { Kiribi } from 'kiribi';
import { KiribiPerformer } from 'kiribi/performer';
import { client } from 'kiribi/client';
import { rest } from 'kiribi/rest';
import { SlackApp, SlackEdgeAppEnv } from 'slack-cloudflare-workers';

export type Payload = {
	text: string;
	body: string;
};

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

export class SlackSender extends KiribiPerformer<Payload, void, SlackEdgeAppEnv> {
	async perform(payload: Payload): Promise<void> {
		console.log('this.env', this.env);
		const slack = new SlackApp({ env: this.env });
		await slack.client.chat.postMessage({
			channel: '01-test-channels',
			text: payload.text,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: payload.body,
					},
				},
			],
		});
	}
}
