---
title: Using OpenAPI and AsyncAPI Tags to Better Organize API Endpoints
authors: Ivan Kahl
image: images/guides/openapi-asyncapi-tags-organize-endpoints.png
canonical_url: https://bump.sh/blog/openapi-tags-organize-endpoints
excerpt: Learn tips and tricks to group related endpoints in a meaningful way.
---

OpenAPI Tags are a great way to organize the API endpoints in [your API Contract](https://bump.sh/blog/api-contracts-extended-introduction).

When developing APIs, it's essential to document the API so that other developers, whether internal or external, can use the API effectively. [OpenAPI](https://spec.openapis.org/oas/latest.html) and [AsyncAPI](https://www.asyncapi.com/docs/reference/specification/latest) are open source specifications useful when writing API contracts.
An [API contract describes the API](https://bump.sh/blog/api-contracts-extended-introduction), including its endpoints, data structures, and security constraints. When writing these, you can use [OpenAPI tags](/help/specifications-support/openapi-support/name-and-sort-resources/#group-by-tag) and [AsyncAPI tags](https://www.asyncapi.com/docs/reference/specification/v2.0.0#tagsObject) to help you categorize your contract so that it's more readable and easier to understand.

Let’s see how that works !

## Tag Example

Typically, OpenAPI and AsyncAPI tags are used to group related endpoints in a meaningful way, such as by business function or logical objects. When using tags, you define an array of tags at the root of your document, like this:

```yaml
tags:
  - name: Clients
    description: Create, update and retrieve client information.
    externalDocs:
      description: Read more
      url: http://docs.example.com/api/clients
  - name: Notifications
    description: Manage notifications for the current user
```

Once you've created these tags, you can use them to group related endpoints in your API using the `tags` property on the endpoint as follows:

```yaml
paths:
  /clients:
    get:
      tags:
        - Clients
      summary: Retrieve all clients.
      description: Retrieves all clients the user has access to.
  /notifications/unread:
    get:
      tags:
        - Notifications
      summary: Retrieves all unread notifications.
      description: Retrieves all unread notifications for the current user.
```

You can also apply multiple tags to an endpoint, as shown in the code snippet below:

```yaml
paths:
  /clients/{clientId}/notifications:
    get:
      tags:
        - Clients
        - Notifications
      summary: Retrieve all the notifications for a particular client.
      description: Retrieves all the notifications for a particular client that the user has access to.
```

## Benefits of OpenAPI and AsyncAPI Tags

Tags are a powerful tool for improving the usability of your API contract. Below are some of the ways using tags can help keep your API contract organized.

### Tags Can Describe Endpoint Groups

When specifying your tags in the root level of your API contract, you can give context to the tag using the `description` property.
Let’s take [Bump.sh API documentation](https://bump.sh/demo/doc/bump). Here is how the `Diffs` tag is created and described in [Bump.sh API Contract](https://developers.bump.sh):

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
```

The documentation will show the `Diffs` property like this:

![Diff attribute in the generated API documentation](/images/guides/diff_attribute.png)
[*See it live*](https://bump.sh/demo/doc/bump/group/endpoint-diffs)

Note that [you can use markdown](/help/enhance-documentation-content/markdown-support/) in the `description` field to better describe your tags.

### Tags Can Link to Additional Documentation

While the `description` property is excellent for giving a little more information about a specific tag, you might need to provide additional documentation if the business logic or object represented by the tag is complex and requires further explanation. Let’s take our Diffs example from above. You can provide a link to an external web page where you offer a more detailed explanation using the `externalDocs` property.

In the code snippet below, the `externalDocs` property provides a link to a URL using the `url` property. A description for the URL can also be specified using the `description` property.

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
    externalDocs:
      description: More details about Diff
      url: /help/api-change-management/
```

When you generate API documentation for the API contract above, you'll see the link rendered like this:

![How the externalDocs property is displayed in generated API documentation.](/images/guides/tag-with-externaldocs.png)

### Tags Can Order Endpoint Groups in Documentation

When specifying your OpenAPI or AsyncAPI tags in the root of your API contract, the order in which you list the tags will define the order in which they appear in the generated documentation. This ordering lets you sort the tags meaningfully.

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
  - name: Ping
    description: Monitoring status endpoints
  - name: Previews
    description: Preview for documentation file
  - name: Versions
    description: Deploy your API contracts
  - name: Validations
    description: Check & validate your API contracts
  - name: Hubs
    description: Interact with your Hubs
```

When you generate API documentation, you'll notice the documentation orders the endpoint groups in the same way:

![How tags are ordered in generated API documentation](/images/guides/tags_order.png)
[*See it live*](https://bump.sh/demo/doc/bump)

Note that [Bump.sh helps you order your endpoints and webhooks](/help/specifications-support/openapi-support/name-and-sort-resources/#group-by-tag) using a "Group by tag" operation. It is actually the default behaviour of Bump.sh when you have these tags defined and have not selected an other sorting option for your Bump.sh API documentation.

Now that you understand what tags are and their benefits, you'll see some best practices you should follow when using OpenAPI and AsyncAPI tags in API contracts.

## OpenAPI Tags Best Practices

### Tag Everything

When using tags, make sure you tag all your endpoints.
Notice how all diff-related endpoints are tagged with the `Diffs` tag in this snippet:

```yaml
paths:
  /diffs:
    post:
      tags: [ Diffs ]
      summary: Create a diff
      [...]
  /diffs/{id}:
    get:
      tags: [ Diffs ]
      summary: Fetch detailed information from an existing diff
      [...]
```

You can [see live](https://developers.bump.sh/group/endpoint-diffs) how they are all available under the section Diffs. By clicking the name of the section in the left menu, the tagged endpoints will show up.

![tagged endpoints on Bump.sh documentation](/images/guides/tagged_endpoints.png)

Untagged endpoints will not show up under any big section represented by a tag of your documentation generated by Bump.sh

To ensure your endpoints remain logically grouped and ordered, always tag every endpoint, even if it means creating a tag for a single endpoint.

### Make Every Tag Unique

When defining the list of tags in the root of your API contract, make sure not to duplicate tag names. Since the tag's `name` property links an endpoint to a tag, duplicate names are likely to confuse developers looking at the API contract.

The code snippet below contains the root Tag Object in an API contract. Notice how the `Validations` tag has been duplicated, and the second definition contains a different description to the first:

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
  - name: Versions
    description: Deploy your API contracts
  - name: Validations
    description: Check & validate your API contracts
  - name: Hubs
    description: Interact with your Hubs
  - name: "Documentation change"
    description: Check & validate your API contracts
  - name: Validations
    description: Validate your API status
```

These duplicate tags would confuse anyone trying to understand your API contract, as they wouldn't know which of the two tag definitions an endpoint belongs to.

Instead, make sure you define and describe every tag only once in the root Tag Object, like in the snippet below:

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
  - name: Versions
    description: Deploy your API contracts
  - name: Validations
    description: Check & validate your API contracts
  - name: Hubs
    description: Interact with your Hubs
  - name: "Documentation change"
    description: Check & validate your API contracts
```

### Define All Your OpenAPI Tags in the Root Tag Object

The OpenAPI specification [doesn't require you to define all your tags in the root Tag Object of your API contract](https://swagger.io/specification/#:~:text=A%20list%20of,MUST%20be%20unique). This means you can add a tag to an endpoint without listing it in the root Tag Object, but this is a bad idea. You won't be able to control what order the OpenAPI tags should appear in, and you won't be able to add a description or provide a link to external documentation for that tag. It can also confuse developers browsing your API contract as they won't see a list of all the tags used in the API contract.

As an example, consider the code snippet below where the `Previews` and the `Ping` tags has not been included in the root Tag Object:

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
  # Missing Previews tag
  # Missing Ping tag
  - name: Versions
    description: Deploy your API contracts
  - name: Validations
    description: Check & validate your API contracts
  - name: Hubs
    description: Interact with your Hubs

paths:
  /diffs:
    post:
      tags: [ Diffs ]
  /diffs/{id}:
    get:
      tags: [ Diffs ]
  /hubs/{hub_id_or_slug}:
    get:
      tags: [ Hubs ]
  /versions:
    post:
      tags: [ Versions ]
  /validations:
    post:
      tags: [ Validations ]
  /previews:
    post:
      tags: [ Previews ]
  /previews/{preview_id}:
    put:
      tags: [ Previews ]
  /versions/{version_id}:
    get:
      tags: [ Versions ]
  /ping:
    get:
      tags: [ Ping ]
```

When you generate the documentation, notice how the `Previews` and `Ping` sections are at the bottom of the list.

![Previews and Ping sections displayed at the bottom](/images/guides/preview_pings_sections.png)

This incorrect ordering and lack of description will make this section much harder to understand for a developer consuming your API.

On the other hand, notice how every endpoint in the API contract below has a tag also defined in the root Tag Object:

```yaml
tags:
  - name: Diffs
    description: Diff summary of changes in the API
  - name: Ping
    description: Check the API status
  - name: Previews
    description: Preview changes to an API Documentation
  - name: Versions
    description: Deploy your API contracts
  - name: Validations
    description: Check & validate your API contracts
  - name: Hubs
    description: Interact with your Hubs

paths:
  /diffs:
    post:
      tags: [ Diffs ]
  /diffs/{id}:
    get:
      tags: [ Diffs ]
  /hubs/{hub_id_or_slug}:
    get:
      tags: [ Hubs ]
  /versions:
    post:
      tags: [ Versions ]
  /validations:
    post:
      tags: [ Validations ]
  /previews:
    post:
      tags: [ Previews ]
  /previews/{preview_id}:
    put:
      tags: [ Previews ]
  /versions/{version_id}:
    get:
      tags: [ Versions ]
  /ping:
    get:
      tags: [ Ping ]
```

By doing this, your documentation will display the endpoint groups in the correct order along with the tag’s description.

![Generated documentation with every tag described in the root Tag Object](/images/guides/tags_order.png)

## Conclusion

In this article, you learned more about OpenAPI and AsyncAPI tags and their value in an API contract. You also learned that you can add descriptions and external documentation links to the tag. This article has also shown you some best practices to follow when using tags that can improve the quality of your generated documentation.

Bump.sh [OpenAPI](https://bump.sh/openapi) and [AsyncAPI documentation generator](https://bump.sh/asyncapi) implement tags to help you keep your API documentation organized. Bump also [detects and notifies you of breaking changes](https://bump.sh/api-change-management) when deploying a new version of your API.

Bump.sh is the simplest way to automatically create [API portals for internal, partner, and public APIs](https://bump.sh/api-catalog). Discover it by [signing up](https://bump.sh/users/sign_up).

