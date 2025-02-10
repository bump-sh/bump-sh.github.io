---
title: The Perfect Modern OpenAPI Workflow
authors: phil
# canonical_url: 
excerpt: TODO
date: 2025-02-10
---

For decades designing and building APIs felt incredibly repetitive, because the whole job seemed to be repeating the "I" in API (Interface) over and over again.

Every APIs would define all the endpoints, properties, data types, values, and validation rules, in all the following places and more: 

- Request validation
- Serializers
- Integration tests
- Contract tests
- API reference documentation
- Postman collections
- Client libraries

The whole job was just repeating "Yes, the /trips` endpoint returns trips and they have these properties in this format" until you went blue in the face, and any effort to automate this was converting infinite tricky formats into other infinite tricky formats with often outdated tooling.

## Modern OpenAPI To the Rescue

The HTTP API ecosystem has been revolutionized by OpenAPI and the countless tooling vendors who have stepped in to making amazing quality interoperable tooling. 

Some people still seem to think OpenAPI is just about API documentation, but as more and more tooling appeared it became about far more than that. OpenAPI is a machine readable declaration of the API interface, also known as an API contract. This single source of truth is helpful the whole way through the API lifecycle, from design to deployment to deprecation, and if it just so happens that format is really good at outputting as API documentation then that's not a bad thing.

## A Full Workflow with OpenAPI

Lots of folks use little bits of OpenAPI tooling in various manual ways, but when it's hooked up to your version control system and/or continuous integration, then a truly amazing and powerful workflow appears.

Here is the objectives for a truly usefl OpenAPI workflow.

- One source of truth where API teams update the contract once.
- Easy Mocking - Easily spin up fake servers for clients to play around with to see if that API design will hold up before time is wasted coding the wrong thing.
- Automated Style Guides - Make sure APIs being designed/built match chosen standards and conventions on commit or earlier.
- Beautiful API documentation - Every change should update API documentation without having to remember to update a CMS or redistribute a PDF.
- Contract testing using any standard test runner: Jest, PHPUnit/Pest, JUnit, RSpec.
- SDK Generators in popular languages to save every team pretending they know how to code well in all those languages, which can be automatically kept up to date as the API evolves.

This felt like a dream for years, but you can do all of this right now, and it's not all locked behind one massive expensive walled garden.

## Git-centric Workflow

The vast majority of software is run through some sort of version control, and this is the perfect place to put OpenAPI too: right in there with the source code. This means that any OpenAPI change can go through a review process, and once the actual API implementation has started being built it means the OpenAPI and the code should always match, allowing for linting and testing. 

Once the changes are merged to the main branch, it means documentation, mock servers, SDKs, and anything else can all be updated along with the main deployment of the source code, so there is no divergence between the code and all these other artifacts.

design-first-workflow.png

### API Linting

Linting can make sure sure that every change makes the API better, with a rules-based engines that allows people to set rules for target anything in the API description. Is the OpenAPI valid, is the API it's describing top quality, is it following the right standards and best practices? 

Tools like [vacuum](https://bump.sh/blog/api-linting-with-vacuum) power this concept, and can be run locally using a CLI, or in Visual Studio using [vacuum-vscode](https://github.com/pb33f/vacuum-vscode) to make sure that the API/OpenAPI is good to go before changes are even committed.

Linting can also be run on pull requests via continuous integration offerings like GitHub Actions. This is a huge piece of the puzzle for "API Design Reviews" and helps cover a chunk of the massive topic that is "API Governance".

Configuring the linter to return errors and warnings as annotations on the problematic lines protects helps highlight dangerous security concerns, bad naming conventions, or anything else you can imagine a rule being created for. 

![](/images/guides/the-perfect-modern-openapi-workflow/vacuum-annotations.png)

### Deploy mocks

GitHub Action to deploy microcks, or just be lazy and let it pull in on the hour. 


### Contract Testing

Contract testing used to be complicated, with dedicated testing tools running in isolation that had know knowledge of what the contract was meant to be until you told it. 

How would a testing tool know what properties were meant to be returned by any particular endpoint in any particular state until it had been programmed in? How would it be aware of changes made in a recent PR unless it was updated once it broke?

Having OpenAPI in the same repository as the source code means that every single commit carries with it a perfect description of what the API should be, so at any point the existing API test suite should be able to use that OpenAPI for comparison against what the code is actually returning. 

For Rails users, this would take the form of the [openapi_contracts](https://rubygems.org/gems/openapi_contracts) gem. Once you've told the RSpec test runner where the OpenAPI document resides, a single assertion can be added to existing tests to confirm the returned response matches the API description.

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

If an API does not have an existing test suite this might seem like a bigger push, but an API without a test suite should absolutely add one, and this can be a good way to get started. Set up one call for each endpoint with basic information, and add other tests for various scenarios over time.

Another option to avoid that is to run contract testing outside of the codebase. To avoid having to train a tool to know what the expected contract is, why not use a tool which already knows what the latest OpenAPI is meant to be at anytime: Microcks again! 

Microcks handles [contract testing](https://docs.bump.sh/guides/bump-sh-tutorials/testing-with-microcks/) as well as mock servers, and it does this by taking a URL to a server for comparison. This could be staging, pre-production, or even production if you're careful. 

It works by going through all the operations in the OpenAPI document, and sending it a reasonable assumption at a 

### Deploy docs

Bump is cool have you heard of it.

### Publish SDK

Automatically update with Speakeasy and pull in the SDK changes to your docs to make it even better.

### Publish to Postman

Link to the guide or just say lol why you need postman when Bump has an API Explorer now. 
