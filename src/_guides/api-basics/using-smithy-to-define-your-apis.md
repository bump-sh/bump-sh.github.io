---
title: Using Smithy to Define Your APIs
authors: james
excerpt: Smithy is an OpenAPI alternative with an interface definition language that supports modeling, designing, and generating API documentation, client code, and server code. 
date: 2025-02-24
---

The OpenAPI Specification is the de facto format for capturing REST-based API details. However, there have been some recent alternatives that have emerged to address different styles of workflows. One such alternative is Smithy, an interface definition language that supports modeling, designing, and generating API documentation, client code, and server code. In this article, we will look at Smithy’s features and how it might support your organization’s preferred API-first approach to API design and delivery. 

## What is Smithy?

[Smithy](https://smithy.io/2.0/index.html) is an **interface definition language (IDL)** and **tooling framework** for defining service APIs and data structures. Initially developed by AWS, it is used to describe APIs in a way that is both machine-readable and human-friendly. Smithy allows for strong typing, model validation, and code generation, making it a powerful tool for defining REST and other service-based APIs.

## Smithy Features

Smithy can be used to define REST APIs by modeling resources, operations, and data types in a structured way. This helps standardize API development, generate client/server code, and enforce best practices. Key features of Smithy include:
1. **Service Definition** – Smithy defines services with their operations, input/output structures, and error handling.
2. **Resource Modeling** – Supports RESTful resource-based modeling.
3. **Data Modeling** – Uses strong typing and constraints for API inputs/outputs.
4. **Validation** – Ensures API definitions conform to best practices while avoiding common pitfalls.
5. **Code Generation** – Can generate SDKs, OpenAPI specs, and server stubs using either built-in or [third-party generators](https://github.com/smithy-lang/awesome-smithy#client-code-generators).
6. **Extensibility** – Can be customized with plugins and integrations. I would recommend starting with the [Awesome Smithy GitHub project](https://github.com/smithy-lang/awesome-smithy) as a starting point for discovering plugins. 

## Smithy’s Role in the API-First Lifecycle

Smithy fits into multiple stages of the API-first lifecycle:

| **Lifecycle Stage**  | **Smithy’s Role** |
|----------------------|------------------|
| **Design & Planning** | Provides a structured way to define APIs before coding. |
| **API Standardization** | Enforces consistency across multiple teams and services. |
| **Code Generation** | Generates OpenAPI specs, client SDKs, and server stubs. |
| **Validation & Governance** | Ensures API definitions conform to enterprise standards. |
| **Documentation** | Provides clear and machine-readable API documentation. |
| **Evolution & Versioning** | Supports API versioning while ensuring backward compatibility. |

Smithy is ideal for API-first organizations. API designers first define the operations and models using the Smithy format, then generate an OpenAPI document as well as client and server code. 

## Smithy vs. OpenAPI

OpenAPI is the gold standard for documenting APIs. So, why do we need another format? While OpenAPI is great at documenting an existing REST-based API, it lacks support for the full API-first lifecycle. For OpenAPI documents to be created, the bulk of the API design must be completed. This is due to OpenAPI’s focus on paths and HTTP methods as the first two elements of a documented API operation. 

Smithy is more flexible and extensible, allowing better data modeling and validation. Models can be defined prior to the operations and validated as part of a continuous delivery pipeline. As the API definition is expanded with operations and error responses, traits may be applied to help shape how the API will be implemented, including any HTTP-specific details. For organizations that leverage OpenAPI-related tooling as part of their delivery pipeline, Smithy can generate OpenAPI specs, bridging the gap between the two quite easily. 

## The Smithy Ecosystem

The Smithy ecosystem is comprised of the following components:

* [The Smithy Specification](https://smithy.io/2.0/spec/index.html) - a formal specification for the IDL, types, and bindings
* [The Smithy Style Guide](https://smithy.io/2.0/guides/style-guide.html) - recommended style guide for writing Smithy-based IDL files in a consistent manner, whether you are a team of one or one of many teams within your organization
* [The Smithy CLI](https://smithy.io/2.0/guides/smithy-cli/index.html) - a command-line interface that helps you build your models, run ad-hoc validation, compare models for differences, query models, and more
* [Smithy Gradle Plugins](https://smithy.io/2.0/guides/gradle-plugin/index.html) - integrates Smithy with the Gradle build system, making it possible to work locally or within a delivery pipeline to validate your models and generate artifacts. 
* [The Smithy Code Generator Guide](https://smithy.io/2.0/guides/building-codegen/index.html) - a guide to building your own code generators using Smithy, including details on how the Smithy generator’s lifecycle and plugin architecture work. 
* [Smithy Examples](https://github.com/smithy-lang/smithy-examples) - a GitHub repository containing examples to help you get started with Smithy. 

As you may have noticed, this is more than a few random tools and examples. Smithy is well documented and thoughtfully designed to be customized in a variety of ways. 

## How Smithy Works

At a high level, Smithy follows a five-step workflow. Let’s look briefly at each of the steps in the workflow and how it contributes to a powerful and flexible API lifecycle. Along the way, I’ll link to files from their [Smithy CLI example](https://github.com/smithy-lang/smithy-examples/tree/main/quickstart-examples/quickstart-cli) repository to avoid cluttering this walkthrough. 

### Step 1. Define a Smithy Build File

The first step is to write a smithy build file. This file uses a JSON format and defines working directories, plugins, and other details that your project will need to use Smithy successfully. You can look at an [example here](https://github.com/smithy-lang/smithy-examples/blob/main/quickstart-examples/quickstart-cli/smithy-build.json). 
You will probably spend some time in this file initially, but once you have everything working the way you want, you will rarely need to revisit this file. 

### Step 2. Define API Models
The next step is to write a `.smithy` model file to define services, resources, and operations. This can be done iteratively, starting with some basic details and expanding over time. This is different from a traditional OpenAPI workflow, where we must know most or all of our API design details before we can produce a valid OpenAPI document. 

Smithy models are written in a human-readable format called Smithy IDL. This format helps to streamline authoring and reading models. We can see an example `weather.smithy` model file [offered in their quickstart](https://github.com/smithy-lang/smithy-examples/blob/main/quickstart-examples/quickstart-cli/models/weather.smithy). The model file is placed into the `models` directory of the project. This folder was referenced in the build file from step 1, helping the Smithy CLI tool to locate all models and process them each in turn. 
You will define one or more model files within your project. Smithy supports namespacing conventions, allowing you to easily reuse and reference different models as needed. 

### Step 3. Validate Models 

Next, we need to ensure our models follow best practices and governance rules. Using the Smithy CLI tool within our project, we can run `smithy validate` to produce a report of any invalid declarations. Common validation checks include:

* Ensure required fields are properly defined.
* Ensure operations have valid HTTP mappings.
* Enforce naming conventions (e.g., camelCase for fields).

We can request that only a specific model is valid or we can validate all models within our project at once. 

### Step 4. Configure Projections

As our models start to take shape, we can add different projections into our build file. Projections are custom transformations of the model into different output formats. There are a few different types of projections available:

| **Projection Type** | **Description** |
|---------------------|----------------|
| **OpenAPI**        | Converts Smithy to an OpenAPI (Swagger) spec. |
| **SDKs**           | Generates client SDKs for multiple languages. |
| **Server Code**    | Creates server stubs for API implementations. |
| **JSON AST**       | Converts Smithy into machine-readable JSON for further analysis, linting, or other uses. |

Given Smithy’s pluggable design, you can add different types of projections available within Smithy, projections from third-party providers, or create your own custom projections. 
Once you have defined the projection(s) you wish to enable for your project, the final step is to generate outputs. 

### Step 5. Generate Outputs
The final step in the workflow is to convert the Smithy model into OpenAPI specifications, SDKs, server stubs, or other artifacts. Smithy recommends integrating this workflow into your CI/CD pipeline, publishing any generated documentation artifacts, such as OpenAPI documents, into your [Bump.sh](https://bump.sh) developer portal for discovery. 

## Final Thoughts on Smithy
Smithy is a very powerful tool for managing your API first lifecycle. Unlike OpenAPI documents, there is more work to do initially to get everything set up and configured properly. However, there is considerable flexibility in being able to define your API resources and operations in Smithy IDL format, run validators to ensure compliance against your organization’s style guide conventions, and expand the details over time until you have a complete API design that can be used to generate client libraries, server-side stubs, and OpenAPI documentation. 






