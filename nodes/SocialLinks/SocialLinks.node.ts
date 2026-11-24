import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const API_BASE = 'https://sociallinks.dev';
const CREDENTIAL = 'socialLinksApi';

export class SocialLinks implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Social Links',
		name: 'socialLinks',
		icon: { light: 'file:sociallinks.svg', dark: 'file:sociallinks.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Resolve a creator profile to accounts across platforms with sociallinks.dev',
		defaults: {
			name: 'Social Links',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: CREDENTIAL, required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Credits',
						value: 'getCredits',
						action: 'Get credit balance',
						description: 'Return the account credit balance',
					},
					{
						name: 'Resolve',
						value: 'resolve',
						action: 'Resolve a creator',
						description: 'Look up a creator from a profile URL or name',
					},
				],
				default: 'resolve',
			},
			{
				displayName: 'Lookup By',
				name: 'lookupBy',
				type: 'options',
				options: [
					{ name: 'Profile URL', value: 'url' },
					{ name: 'Name', value: 'name' },
				],
				default: 'url',
				displayOptions: { show: { operation: ['resolve'] } },
			},
			{
				displayName: 'Profile URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://www.instagram.com/mkbhd',
				description: 'Creator profile page on Instagram, TikTok, YouTube, or X',
				displayOptions: { show: { operation: ['resolve'], lookupBy: ['url'] } },
			},
			{
				displayName: 'Creator Name',
				name: 'creatorName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Marques Brownlee',
				description: 'Creator or brand name when you do not have a profile URL',
				displayOptions: { show: { operation: ['resolve'], lookupBy: ['name'] } },
			},
			{
				displayName: 'Platforms',
				name: 'platforms',
				type: 'string',
				default: '',
				placeholder: 'instagram,tiktok,youtube',
				description:
					'Optional comma-separated platforms to search. Leave empty for all platforms.',
				displayOptions: { show: { operation: ['resolve'] } },
			},
			{
				displayName: 'Confirmed Only',
				name: 'confirmedOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to return only confirmed accounts',
				displayOptions: { show: { operation: ['resolve'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let response: IDataObject;

				if (operation === 'getCredits') {
					response = await apiRequest.call(this, 'GET', '/v1/balance');
				} else if (operation === 'resolve') {
					const lookupBy = this.getNodeParameter('lookupBy', itemIndex) as string;
					const platforms = (this.getNodeParameter('platforms', itemIndex, '') as string).trim();
					const confirmedOnly = this.getNodeParameter('confirmedOnly', itemIndex, false) as boolean;
					const body: IDataObject = { confirmed_only: confirmedOnly };
					if (lookupBy === 'url') {
						body.url = (this.getNodeParameter('url', itemIndex) as string).trim();
					} else {
						body.name = (this.getNodeParameter('creatorName', itemIndex) as string).trim();
					}
					if (platforms) {
						body.platforms = platforms.split(',').map((p) => p.trim()).filter(Boolean);
					}
					response = await apiRequest.call(this, 'POST', '/v1/resolve', {}, body);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex,
					});
				}

				returnData.push({ json: response, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				if ((error as { context?: unknown }).context) {
					(error as { context: { itemIndex: number } }).context.itemIndex = itemIndex;
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}

async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
	body?: IDataObject,
): Promise<IDataObject> {
	try {
		return (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, {
			method,
			url: `${API_BASE}${path}`,
			qs,
			body,
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
