# n8n-nodes-sociallinks

An n8n community node for [sociallinks.dev](https://sociallinks.dev): resolve one creator profile into accounts across platforms, and check your credit balance.

## Installation

In n8n, open **Settings → Community Nodes → Install**, enter `n8n-nodes-sociallinks` and confirm.

## Credentials

1. Create an API key at [sociallinks.dev dashboard](https://sociallinks.dev/dashboard/api#api-keys) (`sl_…`).
2. In n8n, add a **sociallinks.dev API** credential and paste the key.

The key is sent as `Authorization: Bearer`. Saving the credential checks `GET /v1/balance`.

## Operations

### Resolve

Look up a creator from a **Profile URL** or **Name**. Optional platforms filter and confirmed-only flag.

### Get Credits

Returns `{ "credits": N }`. Free.

## Compatibility

No runtime dependencies. Built for n8n community nodes with provenance publish via GitHub Actions.

## Resources

- [API docs](https://sociallinks.dev/api)
- [OpenAPI](https://sociallinks.dev/openapi.json)
