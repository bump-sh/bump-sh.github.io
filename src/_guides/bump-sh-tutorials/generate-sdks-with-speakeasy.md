---
title: Generate SDKs with Speakeasy
authors: phil
excerpt: Help users integrate with your API quicker using client-code in their favourite language.
date: 2024-12-17
---

The quicker a customer can integrate with your API, the quicker your business will be making money or solving problems. Some users will be happy to integrate directly with the API, but many prefer the ease of working within the programming language through Software Development Kits (SDKs). 

These can be a lot of work to build and keep up to date, but if you've got OpenAPI you really don't need to do all that manually. Generate them automatically with Speakeasy, and publish the code samples to your [Bump.sh API documentation](https://bump.sh/api-documentation)! 

## What is Speakeasy

[Speakeasy](https://www.speakeasy.com/) is Software-as-a-Service similar to Bump.sh, but instead of focusing on documentation they focus on SDK generation. In the past you'd have to use cumbersome Java-based open-source tooling and generally develop your own templates, but with Speakeasy you can simply upload an OpenAPI description document and get type-safe SDKs that your team will be proud of: include OAuth2.0, retries, pagination, custom code, and more.

## Step 1: Set up Speakeasy

Head over the [Speakeasy Quickstart](https://www.speakeasy.com/docs/create-client-sdks) or if you'd like to go a little slower you can go through the [Speakeasy Introduction](https://www.speakeasy.com/docs/introduction/introduction). The main thing is to start with installing the Speakeasy CLI which you can do with popular package managers like Homebrew and Chocolatey.

## Step 2: Create Your First SDK

Once you've got Speakeasy CLI set up, run the `speakeasy quickstart` command. You'll be prompted to generate a workspace on their [dashboard](https://app.speakeasy.com/) if you haven't already.

The CLI quickstart wizard will walk you through the process of creating the first SDK, by asking you to point to your OpenAPI document and pick the first language. 

For the sake of the tutorial we're going with TypeScript, but you can pick from Python, Go, Java, PHP, C#, Ruby, Swift, and more. 

![Screenshot of the CLI wizard which is asking: "What directory should the typescript files be written to?"
"We recommend a git repo per SDK. To use the current directory, leave empty." In the input box is the full-path of a new repository as relative filepaths do not seem to work, which is "/Users/phil/src/bump/train-travel-sdk-ts/"](/images/guides/generate-sdks-speakeasy/quickstart-2.webp)

Generally, you'll have a "central" repository which contains your OpenAPI, and Speakeasy suggests creating a new repository for each SDK you generate (although monorepo setups are possible). This repository will hold all the code and the relevant configuration to keep it all running, separate from your main OpenAPI and source code.

![](/images/guides/generate-sdks-speakeasy/new-sdk-repo.png)

For example, if you ran the `speakeasy quickstart` from `/Users/phil/src/train-travel-api`, you might make a new repository for the TypeScript SDK next to that directory in `/Users/phil/src/train-travel-sdk-ts`. 

Enter a path like that into the quickstart, and the local Git repository will be created for you. You can add, commit, and push everything to a new GitHub repository of your choosing. 

```bash
cd ~/src/train-travel-sdk-ts
git remote add origin git@github.com:bump-sh-examples/train-travel-sdk-ts.git
git add --all
git commit -m "initial commit"
git push origin main
```

Once you've got everything inside this lovely new generated codebase pushed to GitHub, you can create GitHub Actions to automatically create pull requests when changes are detected on the OpenAPI.

## Step 3: Configure GitHub

GitHub Actions help us to automate generating and releasing new versions of the SDKs over time as your API and the OpenAPI that describes it evolve.

```bash
speakeasy configure github
```

This create a new `.github/workflows/sdk_generation.yaml` which will do a few things. It's main job is to set up a cron job which will open pull requests to generate a new SDK for you once a day if there are changes.  To make it work check the output of that command which outlines a bunch of steps, from creating an `SPEAKEASY_API_KEY` environment variables, and allowing the GitHub Action to open up pull requests. 

One other thing, to make this work on GitHub instead of just working locally, is to update the "target" in the Speakeasy SDK workflow document: `.speakeasy/workflow.yaml`. 

By default it was set to the following:

```yaml
sources:
  Train Travel API:
    inputs:
      - location: ../train-travel-api/openapi.yaml
```

This was causing some confusion for the Speakeasy GitHub action because it was literally looking for that local path when the GitHub Action was being run, and that's the folder structure on the local machine which isn't there. To make this work on GitHub you can grab the public "raw" URL:

```yaml
sources:
  Train Travel API:
    inputs:
      - location: https://raw.githubusercontent.com/bump-sh-examples/train-travel-api/refs/heads/main/openapi.yaml
```

Public URLs like this will only work for public GitHub repos, but if you cannot make the repo public you can pop this onto S3 or somewhere else.

**Please do all of these steps or things will not work.**

Commit and push all of these changes to main, and the repository is in good shape. 

## Step 4: Publish Code to Package Managers

Once GitHub is automatically creating pull requests to update the codebase in your repository, you might want to do something with that code, like publish that code as a package to package managers like NPM, PyPI, Packagist, NuGet, and Maven.

For the sake of the tutorial, we're publishing to NPM. The easiest way is to follow the standard process of creating a NPM package, by doing it manually at first, then letting Speakeasy take over after.

```bash
npm login
npm publish
```

If this all worked then count to 100 and you should see your new package! 

![](/images/guides/generate-sdks-speakeasy/publish-to-npm.png)

Now our `train-travel-sdk` actually exists online, and you can [see how it's going from here](https://www.npmjs.com/package/train-travel-sdk).

To save somebody having to run a command to publish this SDK (and every other SDK you end up making) every time anything changes, we can ask GitHub and Speakeasy to handle all of that for us.

```bash
speakeasy configure publishing
```

This will create another github workflow which will help publish the package automatically, and should look a bit like this:

```yaml
# .github/workflows/sdks.yml
name: Publish SDKs
permissions:
  checks: write
  contents: write
  pull-requests: write
  statuses: write
  id-token: write
"on":
  push:
    branches:
      - main
    paths:
      - .speakeasy/gen.lock
  workflow_dispatch: {}
jobs:
  publish:
    uses: speakeasy-api/sdk-generation-action/.github/workflows/sdk-publish.yaml@v15
    with:
      target: train-travel-sdk
    secrets:
      github_access_token: ${{ secrets.GITHUB_TOKEN }}
      npm_token: ${{ secrets.NPM_TOKEN }}
      speakeasy_api_key: ${{ secrets.SPEAKEASY_API_KEY }}
```

Notice it is still using the `SPEAKEASY_API_KEY` that we used in the generate workflow, but now there's a `NPM_TOKEN` we'll need to add. Grab that from your [NPM account](https://www.npmjs.com/login) under Access Tokens, make sure it has write permission for packages, and save it as `NPM_TOKEN` in your repo GitHub repository Actions secrets.

Now if you push commits your main branch or merge a pull request, this GitHub Action will automatically help publish a new version of the SDK. 

![](/images/guides/generate-sdks-speakeasy/npm-new-version.png)

From here, if you change anything relevant in the SDK repo, it'll publish a new SDK, and if the central OpenAPI changes it will also publish a new SDK. This solves a lot of the frustrations with managing packages too, such as manually bumping version numbers and figuring out if it should be major, minor, or patch, or setting up confusing conventions for automatically doing it like Semantic Release. Speakeasy and GitHub Actions (or similar) can just do all that for you as changes are merged.

With everything be entirely automated we can leave the SDK to itself, and the DevRel team can focus on tell everyone about how amazing it is.

## Step 5: Integrating Code Samples into OpenAPI with Overlays

In the past people would either have completely separate "API Docs" and "SDK Docs", or they would spend countless hours copying and pasting SDK examples into the API Docs. 

No more! 

You can grab the latest SDK code samples right from Speakeasy, and merge them into your Bump.sh API documentation using [OpenAPI Overlays](https://docs.bump.sh/guides/technical-writing/efficient-tech-writing-process/) which Speakeasy create for you.

If you don't know what Overlays are, that's ok, you don't really need to. Simply, they are a list of changes that should be applied to an OpenAPI document, and Speakeasy has done the hard work of making them already, so all you need to do is grab a URL. To do this, head to the API registry and look for something like "train-travel-api-typescript-code-samples". 

![Screenshot of the Speakeasy dashboard on the "API Registries" tab. It has a list of three items for the same API: train-travel-api, train-travel-api-typescript-code-samples, train-travel-api-with-code-samples](/images/guides/generate-sdks-speakeasy/api-registries.png)

Check the private/public toggle on, and copy the URL. Paste it into your browser to see how it looks, and you should see something like this:

![](/images/guides/generate-sdks-speakeasy/overlays.png)

This overlay document will show you exactly what it's trying to do. It has a series of `actions`, which look for a specific `target` within the OpenAPI, and update the `x-codeSamples` with a perfect example of the SDK in action for _every single operation_ in your OpenAPI document.

```yaml
overlay: 1.0.0
info:
  title: CodeSamples overlay for typescript target
  version: 0.0.0
actions:
  - target: $["paths"]["/bookings"]["get"]
    update:
      x-codeSamples:
        - lang: typescript
          label: bookings
          source: |-
            import { TrainTravelSDK } from "train-travel-sdk";

            const trainTravelSDK = new TrainTravelSDK({
              oAuth2: process.env["TRAINTRAVELSDK_O_AUTH2"] ?? "",
            });

            async function run() {
              const result = await trainTravelSDK.bookings.list({
                page: 1,
                limit: 10,
              });

              // Handle the result
              console.log(result);
            }

            run();
```

The overlay will be much bigger than this, and it might not make sense to look at it directly, so lets apply it to an OpenAPI document to see how it all fits together. The [Bump.sh CLI](https://www.npmjs.com/package/bump-cli) can help us out here.

Switch back to the repository where your OpenAPI document lives.

```bash
bump overlay openapi.yaml \
  https://spec.speakeasy.com/bumpsh/bumpsh/train-travel-api-typescript-code-samples \
  > openapi.codegen.yaml
```

Updating `openapi.yaml` to wherever your OpenAPI document lives, and `https://spec.speakeasy.com/bumpsh/bumpsh/train-travel-api-typescript-code-samples` URL to whatever URL you copied from the API Registry entry labelled with "Code Samples", then `openapi.codegen.yaml` will be the output of those overlays once applied to the OpenAPI.

As always you can use Bump.sh to get a proper view of an OpenAPI document as human-readable API documentation, so lets point it at our newly overlayed document.

```bash
bump preview openapi.codegen.yaml
```

Open the preview link in the CLI output and you should see something like this:

![](/images/guides/generate-sdks-speakeasy/preview-code-samples.png)

Amazing! The TypeScript SDK is now integrated into the API documentation, and the consumer doesn't have to look at cURL commands to see how they might work with the API.

## Step 6: Applying Code Sample Overlays on Bump.sh Deployments

To get this deployed you can do the same thing you just did, run the overlay then publish the resulting document. This will work on any continuous integration solution, just deploy the temporary created document instead of the original.

In GitHub Actions, it will work like this:

```yaml
# .github/workflows/bump.yml
name: Deploy API documentation

on:
  push:
    branches:
      - main

jobs:
  deploy-doc:
    if: ${{ github.event_name == 'push' }}
    name: Deploy API documentation on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Add TypeScript SDK Samples to OpenAPI
        run: |
          npx bump-cli overlay openapi.yaml \
            https://spec.speakeasy.com/bumpsh/bumpsh/train-travel-api-typescript-code-samples \
            > openapi.codegen.yaml

      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          doc: <your-doc-id-or-slug>
          token: ${{secrets.BUMP_TOKEN}}
          file: openapi.codegen.yaml
```

That's all you need to do. Commit that, and you'll be generating and deploying OpenAPI-based API Reference Documentation with the very latest version of the code samples.

See how they look here on the hosted [Train Travel API documentation](https://bump.sh/bump-examples/doc/train-travel-api).

## Next Steps

**Documenting Multiple SDKs**

To generate multiple SDK languages just repeat the process, to create another SDK on Speakeasy, with another repo, get that repo automated, then in the central repository containing the OpenAPI add more lines to the overlay command.

```yaml
  - name: Add TypeScript SDK Samples to OpenAPI
    run: |
      npx bump-cli overlay openapi.yaml \
        https://spec.speakeasy.com/bumpsh/bumpsh/train-travel-api-typescript-code-samples \
        > openapi.codegen1.yaml

  - name: Add PHP SDK Samples to OpenAPI
    run: |
      npx bump-cli overlay openapi.codegen1.yaml \
        https://spec.speakeasy.com/bumpsh/bumpsh/train-travel-api-php-code-samples \
        > openapi.codegen2.yaml

  - name: Deploy API documentation
    uses: bump-sh/github-action@v1
    with:
      doc: <your-doc-id-or-slug>
      token: ${{secrets.BUMP_TOKEN}}
      file: openapi.codegen2.yaml
```

**Including SDK Setup Instructions**

If you'd like to add some extra documentation about how to install these SDKs for your users, check out our guides on [Topics](https://docs.bump.sh/help/documentation-experience/topics/), or update the existing OpenAPI with [overlays of your own](https://docs.bump.sh/guides/technical-writing/efficient-tech-writing-process/).
