---
title: Integrate Stainless with Bump.sh API docs
authors: stainless-sam
excerpt: Accelerate adoption of your API with native SDK examples automatically integrated into your API documentation
date: 2025-02-28
---

[Stainless](https://www.stainless.com) transforms your OpenAPI specification into powerful, future proof, and ergonomic SDK client libraries that developers
actually want to use. You can connect these SDKs with your [Bump.sh](https://bump.sh) API documentation to create a
seamless workflow:

1. **SDK Generation**: Your OpenAPI spec becomes the source of truth for generating robust and polished client libraries
2. **Code Sample Injection**: Each API endpoint in your documentation is enhanced with language-specific implementation examples
3. **Live Documentation**: Developers see exactly how to call your API using your official SDKs alongside the raw HTTP details

This integration automatically injects idiomatic code samples for each endpoint, bridging the gap between documentation and implementation. Developers get exactly what they need: copy-paste-ready examples that demonstrate your API in action. As your API evolves, both your SDKs and documentation automatically stay in sync.

This guide will walk you through the setup process to create this seamless developer experience.

## Prerequisites

Before starting, make sure you have:

- An account on [Stainless](https://app.stainless.com/signup)
- An existing [Bump.sh](https://bump.sh/) documentation project
- Your OpenAPI specification

## Setting Up Stainless for Your API

### Create Your SDK in Stainless Studio

1. Log in to the [Stainless dashboard](https://app.stainless.com/)
2. Click "New Project" and upload your OpenAPI specification
3. Stainless will analyze your API and create an initial SDK configuration

The Stainless Studio provides an immediate preview of your SDK structure based on your API's resources, endpoints, and models.

![Stainless SDK Studio showing SDK preview](/images/guides/stainless-integration/studio-preview.png)

When first created, Stainless organizes your API into logical resources, but the exact names and hierarchy is up to you,
allowing you to create the most intuitive experience for your users.

The Studio lets you customize everything from resource naming to authentication schemes - dive into the [configuration
guide](https://app.stainless.com/docs/guides/configure) to learn how to prepare SDKs developers will love.

### Generate Code Examples

In the Studio, add the following to your Stainless configuration file:

```yaml
openapi:
  code_samples: "bump.sh"
```

This tells Stainless to create a copy of your OpenAPI file extended with SDK code examples, in a format Bump.sh can
render. For advanced integration options and support for other documentation platforms, explore the [documentation integration guide](https://app.stainless.com/docs/guides/integrate-docs).

### Create an API key

For the next step, you will need an API key to be able to interact with Stainless' API.

Go to your Stainless org page, select the "API Keys" tab, and create a new key.

![Form to create an API key to use Stainless API](/images/guides/stainless-integration/create-api-key.png)

Note: the API key should be considered secret and will only be shown once, be sure to copy and store it to a safe location,
such as a password manager.

Now go to the GitHub repository where your OpenAPI spec is located, and add a GitHub secret named `STAINLESS_API_KEY`,
with the API key as value.

## Connecting Stainless with Bump.sh

The most efficient way to keep your SDK in sync with your documentation is through CI/CD automation.
Stainless provides a
[GitHub Action](https://github.com/marketplace/actions/stainless-upload-openapi-specification) to simplify that process:

```yaml
# File .github/workflows/ci.yml

name: Upload OpenAPI spec to Stainless and Bump.sh

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write

jobs:
  update-docs:
    if: ${{ github.event_name == 'push' || github.event_name == 'workflow_dispatch' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Push spec file to Stainless
        uses: stainless-api/upload-openapi-spec-action@main
        with:
          stainless_api_key: ${{ secrets.STAINLESS_API_KEY }}
          project_name: <your-stainless-project-name>
          # Note: this should be the path to your specification file
          input_path: "path/to/my-company-openapi.json"
          # Note: this file will be your spec extended with code samples
          output_path: "./openapi-with-code-samples.json"

      - name: Deploy API docs to Bump.sh
        uses: bump-sh/github-action@v1
        with:
          doc: <your-bump-doc-id>
          token: ${{secrets.BUMP_TOKEN}}
          # Note: be sure this is pointing to the extended spec file
          file: "./openapi-with-code-samples.json"

api-diff:
  if: ${{ github.event_name == 'pull_request' }}
  name: Check API diff with Bump.sh
  runs-on: ubuntu-latest
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Comment pull request with API diff
      uses: bump-sh/github-action@v1
      with:
        doc: <your-bump-doc-id>
        token: ${{secrets.BUMP_TOKEN}}
        # Note: this should be the path to your specification file
        file: "path/to/my-company-openapi.json"
        command: diff
      env:
        GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

This workflow will do two things:

1. Whenever a Pull Request is created or updated, Bump.sh will generate a diff and submit a PR comment
2. When commits are pushed to your `main` branch, your OpenAPI spec file is uploaded to Stainless, triggering a new
   update to your SDKs. And a copy of your specification file extended with code samples is submitted to Bump.sh, to
   ensure your docs are in sync.

By combining Stainless's SDK generation with Bump.sh's documentation capabilities, you're providing developers with a seamless experience from discovery to implementation.
