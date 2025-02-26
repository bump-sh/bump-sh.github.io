---
title: The Perfect Modern OpenAPI Workflow
authors: phil
# canonical_url: 
excerpt: TODO
date: 2025-02-10
---

For decades designing and building APIs felt incredibly repetitive, because the whole job seemed to be repeating the "I" in API (Interface) over and over again in various formats. Every APIs would define all the endpoints, properties, data types, values, and validation rules, in all the following places and more: 

- Request validation
- Serializers
- Integration tests
- Contract tests
- API reference documentation
- Postman collections
- Client libraries

The whole job was just repeating "Yes, the `/trips` endpoint returns Trips and they have these properties in this format" until you went blue in the face, and any effort to automate this was converting infinite tricky formats into other tricky formats, with often outdated tooling and a whole lot of duct tape.

## Modern OpenAPI To the Rescue

The HTTP API ecosystem has been revolutionized by OpenAPI, and the countless tooling vendors who have stepped in to making amazing quality interoperable tooling around it. Some people still seem to think OpenAPI is just about API documentation, but as more and more tooling appeared it has clearly defined its time and cost savings throughout the API design and development process and beyond. 

OpenAPI is a machine readable declaration of the API interface, also known as an API contract. This single source of truth is helpful the whole way through the API lifecycle, from design to deployment to deprecation, and if it just so happens that format is really good at outputting as API documentation then that's not a bad thing.

## A Full Workflow with OpenAPI

Lots of folks use little bits of OpenAPI tooling in various manual ways, but there is more to be done. Once OpenAPI is placed in version control, and tooling is triggered via continuous integration, a truly amazing and powerful workflow appears.

Here is the objectives for a truly useful OpenAPI workflow.

- One source of truth where API teams update the contract once.
- API Mocking - Easily spin up fake servers for clients to play around with to see if that API design will hold up before time is wasted coding the wrong thing.
- Automated Style Guides - Make sure APIs being designed/built match chosen standards and conventions on commit or earlier.
- Beautiful API documentation - Every change should update API documentation without having to remember to update a CMS or redistribute a PDF.
- Contract testing using any standard test runner: Jest, PHPUnit/Pest, JUnit, RSpec.
- SDK Generators in popular languages to save every team pretending they know how to code well in all those languages, which can be automatically kept up to date as the API evolves.

This felt like a dream for years, but you can do all of this right now, and it's not all locked behind one massive expensive walled garden.

## Git-centric Workflow

The vast majority of software is run through some sort of version control, and this is the perfect place to put OpenAPI too: right in there with the source code. This means that any OpenAPI change can go through a review process, and once the actual API implementation has started being built it means the OpenAPI and the code should always match, allowing for linting and testing. 

Once the changes are merged to the main branch, it means documentation, mock servers, SDKs, and anything else can all be updated along with the main deployment of the source code, so there is no divergence between the code and all these other artifacts.

![](/images/guides/design-first/code-first-design-first.png)

### API Linting

Linting can make sure sure that every change makes the API better, with a rules-based engines that allows people to set rules for target anything in the API description. Is the OpenAPI valid, is the API it's describing top quality, is it following the right standards and best practices? 

Tools like [vacuum](https://bump.sh/blog/api-linting-with-vacuum) power this concept, and can be run locally using a CLI, or in Visual Studio using [vacuum-vscode](https://github.com/pb33f/vacuum-vscode) to make sure that the API/OpenAPI is good to go before changes are even committed.

Linting can also be run on pull requests via continuous integration offerings like GitHub Actions. This is a huge piece of the puzzle for "API Design Reviews" and helps cover a chunk of the massive topic that is "API Governance".

Configuring the linter to return errors and warnings as annotations on the problematic lines protects helps highlight dangerous security concerns, bad naming conventions, or anything else you can imagine a rule being created for. 

![](/images/guides/the-perfect-modern-openapi-workflow/vacuum-annotations.png)

### Deploy Documentation

Updating OpenAPI is the easiest way to maintain up-to-date documentation, without having to remember to go and update some wiki/CMS somewhere. Tools like Bump.sh provide hosted API documentation which can be updated every time the Git repo receives updated OpenAPI.

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy API documentation

on:
  push:
    branches:
      - main

jobs:
  deploy-openapi:
    if: ${{ github.event_name == 'push' }}
    name: Deploy API documentation on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          doc: <your-doc-id-or-slug>
          token: ${{secrets.BUMP_TOKEN}}
          file: api/openapi.yaml
```

### Deploy Mocks

There are countless API mocking tools out there, many of which work with OpenAPI to save the manual effort of updating them every time an API changes, whether that is throughout design and development phases, or later as the API evolves.

One such tool is Microcks, a self-hosted mock server with an admin interface and easily accessible HTTP endpoints that simulate the API being described in OpenAPI. You could log into that admin panel and let it know somebody has updated the OpenAPI every now and then, but why not automate that to save time.

One approach is to push with GitHub Actions, which look a bit like this:

```yaml
# .github/workflows/api-mocks.yml
name: Deploy API mocks

on:
  push:
    branches:
      - main

jobs:
  deploy-mocks:
    if: ${{ github.event_name == 'push' }}
    name: Deploy API mocks to Microcks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: microcks/import-github-action@v1
        with:
          specificationFiles: 'api/openapi.yaml:true'
          microcksURL: 'https://mocks.example.com/api/'
          keycloakClientId:  ${{ secrets.MICROCKS_SERVICE_ACCOUNT }}
          keycloakClientSecret:  ${{ secrets.MICROCKS_SERVICE_ACCOUNT_CREDENTIALS }}

```

This workflow could be combined with other jobs, or it could be left as its own workflow like this for clarity. Either way, whenever a change is made to the `main` branch the mock servers will be updated and instantly reflect the latest OpenAPI.

*Learn more about [API mocking with Microcks](/guides/bump-sh-tutorials/mocking-with-microcks/).*

### Contract Testing

Contract testing used to be complicated, with dedicated testing tools running in isolation that had know knowledge of what the contract was meant to be until you told it. 

How would a testing tool know what properties were meant to be returned by any particular endpoint in any particular state until it had been programmed in? How would it be aware of changes made in a recent PR unless it was updated once it broke?

Having OpenAPI in the same repository as the source code means that every single commit carries with it a perfect description of what the API should be, so at any point the existing API test suite should be able to use that OpenAPI for comparison against what the code is actually returning. 

For Rails users, this would take the form of the [openapi_contracts](https://rubygems.org/gems/openapi_contracts) gem. Once the RSpec test runner is aware of where the OpenAPI document resides, a single assertion can be added to existing tests to confirm the returned response matches the API description.

```ruby
require "rails_helper"

RSpec.describe 'widgets', type: :request do
  
  describe "GET /widgets" do
    it 'responds with 200 and matches the doc' do
      get '/widgets'
      expect(response).to match_openapi_doc(OPENAPI_DOC)
    end
  end

end
```

Requests that were sent can also be validated to confirm both sides of the HTTP interaction.

```ruby
it do
  is_expected.to match_openapi_doc(
	  OPENAPI_DOC,
	  request_body: true
  ).with_http_status(:created)
end
```

Running this contract testing is done whenever the existing test suite is run.

```yaml
# .github/workflows/tests.yaml
name: Run RSpec tests
on: [push]
jobs:
  run-rspec-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          # runs 'bundle install' and caches installed gems automatically
          bundler-cache: true
      - name: Run tests
        run: |
          bundle exec rspec
```

> For a more in depth example, see [how to contract test in Rails](/guides/openapi/design-first-rails/), or see [how to do the same with Laravel PHP](/guides/openapi/design-first-laravel-php/). If you'd like to see a similar guide for your favorite language/framework please [get in touch](mailto:hello@bump.sh).
{: .info }

If an API does not have an existing test suite this might seem like a bigger push, but an API without a test suite should absolutely add one. Working with a generic test suite and adding in some OpenAPI assertions can be a great way to start off a larger test suite. Set up one HTTP request for each API endpoint, with basic information, and add other tests for various scenarios over time as bugs are squashed.

Another option to avoid that is to run contract testing outside of the codebase. To avoid having to train a tool to know what the expected contract is, why not use a tool which already knows what the latest OpenAPI is meant to be at anytime: Microcks again! 

Microcks handles [contract testing](https://docs.bump.sh/guides/bump-sh-tutorials/testing-with-microcks/) as well as mock servers, and it does this by taking a URL to a server for comparison. This could be staging, pre-production, or even production if you're careful. 

It works by going through all the operations in the OpenAPI document, and uses the examples and schemas defined there to send a request that should work, to an API instance of your choosing. This could be production if you are brave, or some other staging/testing environment, but the logic is simple:

1. Send HTTP requests.
2. See if that fails unexpectedly. 
3. Receive HTTP response.
4. See if that matches the OpenAPI document.

This could be automated to run at regular intervals, or it could be triggered to run on pull requests and merges to make sure that any and all API or OpenAPI changes agree with each other. GitHub Actions is once again a good way to get this done.

```yaml
# .github/workflows/contract-testing.yml
name: API Contract Testing
on: [push]
jobs:
  contract-testing:
    name: Deploy API documentation on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: microcks/import-github-action@v1
        with:
          specificationFiles: 'api/openapi.yaml:true'
          microcksURL: 'https://mocks.example.com/api/'
          keycloakClientId:  ${{ secrets.MICROCKS_SERVICE_ACCOUNT }}
          keycloakClientSecret:  ${{ secrets.MICROCKS_SERVICE_ACCOUNT_CREDENTIALS }}

      - uses: microcks/test-github-action@v1
        with:
          apiNameAndVersion: 'Train Travel API:1.0.0'
          testEndpoint: 'http://api-testing.example.com'
          runner: OPEN_API_SCHEMA
          microcksURL: 'https://mocks.example.com/api/'
          keycloakClientId:  ${{ secrets.MICROCKS_SERVICE_ACCOUNT }}
          keycloakClientSecret:  ${{ secrets.MICROCKS_SERVICE_ACCOUNT_CREDENTIALS }}
          waitFor: '10sec'
```

This can replace the `.github/workflows/api-mocks.yaml` workflow above which only wanted to update the mocks, allowing you to update moth mocks and run the contract testing to make sure the real API matches the OpenAPI that describes it, which also happens to ensure that the mock server is matching the actual API too.

*Learn more about [contract testing with Microcks](/guides/bump-sh-tutorials/testing-with-microcks/).*

### Publish SDK

The quicker a customer can integrate with your API, the quicker your business will be making money or solving problems. Some users will be happy to integrate directly with the API, but many prefer the ease of working within the programming language through Software Development Kits (SDKs).

These can be a lot of work to build and keep up to date, but OpenAPI allows API providers to automate the creation of code libraries which allow API consumers to work in their programming language of choice instead of poking and prodding over HTTP directly. 

SDK generation tools have been around for a long time, but in the past you'd have to use cumbersome Java-based open-source tooling and generally develop your own templates. Modern tooling like [Speakeasy](/guides/bump-sh-tutorials/generate-sdks-with-speakeasy/) allows API providers to point to an OpenAPI document, and produce type-safe SDKs that your team will be proud of. These will handle tricky functionality like OAuth 2, retries, pagination, and even allow for adding custom code to the generated output.

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

Speakeasy will automatically generate these SDKs on every push to the `main` branch, taggin versions as appropriate. With a bit of other setup, these SDKs can be pushed directly to package managers like NPM, PyPI, Packagist, NuGet, and Maven.

Once this is done, you can update API documentation on Bump.sh to include these SDKs in the code examples, instead of the default of showing curl CLI examples, or rudimentary code samples like using `fetch()` or other low-level HTTP code.

![The Train Travel API documentation example on Bump.sh with a TypeScript SDK generated by Speakeasy showing in the documentation.](/images/guides/the-perfect-workflow/bump-sdks.png)

*Learn more about [SDK generation with Speakeasy](/guides/bump-sh-tutorials/generate-sdks-with-speakeasy/).*

### Changes & Reviews

When OpenAPI changes in pull requests somebody is going to need to review it. To make their life a little easier, Bump.sh can detect and report changes, and deploy a preview of the OpenAPI documentation 

```yaml
# .github/workflows/api-docs.yaml
name: API Changes
permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
    branches:
      - main

jobs:
  changes:
    name: Check API diff on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Comment pull request with API diff
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: openapi.yaml
          command: diff

      - name: Comment pull request with API diff
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: openapi.yaml
          command: preview
```

Automatically update with Speakeasy and pull in the SDK changes to your docs to make it even better.

### Publish to Postman

Link to the guide or just say lol why you need postman when Bump has an API Explorer now. 
