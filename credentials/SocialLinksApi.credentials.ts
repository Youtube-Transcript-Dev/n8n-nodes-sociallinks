import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SocialLinksApi implements ICredentialType {
	name = 'socialLinksApi';

	displayName = 'sociallinks.dev API';

	icon: Icon = {
		light: 'file:../nodes/SocialLinks/sociallinks.svg',
		dark: 'file:../nodes/SocialLinks/sociallinks.dark.svg',
	};

	documentationUrl = 'https://sociallinks.dev/dashboard/api#api-keys';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Create a key at https://sociallinks.dev/dashboard/api#api-keys (starts with sl_)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://sociallinks.dev',
			url: '/v1/balance',
			method: 'GET',
		},
	};
}
