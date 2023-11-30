---
title: Bump CLI
---

- TOC
{:toc}

The Bump CLI is used to interact with your API documentation or hubs hosted on Bump.sh. With any API contract of you choice (from Swagger, OpenAPI v3 or AsyncAPI v2), it can help you to:

- Validate an API document before publishing to your documentation
- Publish an API document to your Bump.sh documentation or hubs
- Compare two API documents to generate a human readable diff from your API contracts

## Installation

Bump CLI is a node package, currently distributed via NPM which means you need to have Node v14+ interpreter installed on your computer or CI servers.

_If you are looking to use Bump in a continuous integration environment you might be interested by [our Github Action](https://github.com/marketplace/actions/api-documentation-on-bump)._

> You can download a standalone package directly from the latest
> Github release assets if you don’t use Node. We plan to distribute
> universal binaries to common package managers soon. Please check our
> installation methods for updates.
{: .info}

### Global installation

To install it globally, run the following command with NPM

```shell
npm install -g bump-cli
```

Or, with Yarn via

```shell
yarn global add bump-cli
```

### Add Bump.sh to your node project

As our CLI is a node package, you can easily embed it to your project by adding the package to your `package.json` file, either with NPM

```shell
npm install --save-dev bump-cli
```

Or with Yarn via

```shell
yarn add --dev bump-cli
```

You can then use any Bump commands with `npx` (same as `npm exec`)

```shell
npx bump --help
```

### How should I do if I'm not using npm ?

Unfortunately, at the moment we only support the Node environment. However we plan to distribute universal binaries in the most common package managers very soon. In the meantime, you can download a standalone package directly from the [latest Github release](https://github.com/bump-sh/cli/releases) assets or you can push your documentation using [our API](https://developers.bump.sh/) (advanced usage only).

## Usage

To list all the available commands, just type `bump` in your command line environment.

```shell
$ bump --help
The Bump CLI is used to interact with your API documentation hosted on Bump by using the API of developers.bump.sh

VERSION
  bump-cli/2.7.2 linux-x64 node-v16.17.0

USAGE
  $ bump [COMMAND]

COMMANDS
  deploy   Create a new version of your documentation from the given file or URL.
  diff     Get a comparison diff with your documentation from the given file or URL.
  help     Display help for bump.
  preview  Create a documentation preview from the given file or URL.
```

 You can also get some help anytime by adding `--help` to any command. Example: `bump deploy --help`.

## Prepare your Bump.sh account

While some commands don't need any API token (`preview` or `diff`) you will need an access key if you want to interact with your Bump.sh documentation.

Head to your Documentation Settings in the “CI deployment” section, or your Account or Organization Settings in the “API keys” section to fetch a personnal token for later usage.

## Commands

* [`bump deploy [FILE]`](#bump-deploy-file)
* [`bump diff [FILE]`](#bump-diff-file)
* [`bump preview [FILE]`](#bump-preview-file)

### `bump deploy [FILE]`

When you update your API, you want its documentation to be live for your API users. This is what the deploy command is for. Publish a new API document with this command, and Bump.sh will analyse your API structure and generate a changelog item if the API structure has changed. It will also update your latest published document with the deployed file.

```shell
bump deploy path/to/api-document.yml --doc my-documentation --token $DOC_TOKEN
```

> You can find your own `my-documentation` slug and `$DOC_TOKEN` api key from your [documentation settings](https://bump.sh/docs).
{: .info}

You can also deploy a given file to a different branch of your documentation with the `--branch <branch-name>` parameter. Please note the branch will be created if it doesn’t exist. More details about the branching feature is available on [this dedicated help page](https://docs.bump.sh/help/branching). E.g. deploy the API document to the `staging` branch of the documentation:

```shell
bump deploy path/to/api-document.yml --doc my-documentation --token $DOC_TOKEN --branch staging
```

#### Deploy a folder all at once

If you already have a hub in your [Bump.sh](https://bump.sh) account, you can automatically create documentation inside it and deploy to it by publishing a whole directory containing multiple API documents in a single command

```shell
bump deploy dir/path/to/apis/ --auto-create --hub my-hub --token $HUB_TOKEN
```

> You can find your own `my-hub` slug and `$HUB_TOKEN` api key from your [hub settings](https://bump.sh/hubs).
{: .info}

Please note, by default, only files named `{slug}-api.[format]` are published. Where `{slug}` is a name for your API and `[format]` is either `yaml` or `json`. Take into account your own file naming convention by using the `--filename-pattern <pattern>` option.

Note that it _can_ include `*` wildcard special character, but **must** include the `{slug}` filter to extract your documentation’s slug from the filename. The pattern can also have any other optional fixed characters.

Here’s a practical example. Suppose you have the following files in your `path/to/apis/` directory:

```
path/to/apis
└─ private-api-users-service.json
└─ partner-api-payments-service.yml
└─ public-api-contracts-service.yml
└─ data.json
└─ README.md
```

In order to deploy the 3 services api definition files from this folder (`private-api-users-service.json`, `partner-api-payments-service.yml` and `public-api-contracts-service.yml`). You can execute the following command:

```
bump deploy path/to/apis/ --hub my-hub --filename-pattern '*-api-{slug}-service'
```

#### Validate an API document

Simulate a deployment of your API document to make sure it is valid by adding the `--dry-run` flag to the `deploy` command, it is particularly useful in a Continuous Integration environment running a test deployment outside your main branch:

```shell
bump deploy path/to/api-document.yml --dry-run --doc my-documentation --token $DOC_TOKEN
```

Please check `bump deploy --help` for more usage details.

### `bump diff [FILE]`

_If you want to receive automatic `bump diff` results on your Github Pull Requests you might be interested by [our Github Action](https://github.com/marketplace/actions/api-documentation-on-bump#api-diff-on-pull-requests) diff command._

#### Public API diffs

From any two API documents or URLs, you can retrieve a comprehensive changelog of what has changed between them.

```shell
$ bump diff path/to/your/file.yml path/to/your/second_file.yml
* Comparing the two given definition files... done
Modified: GET /consommations
  Response modified: 200
    [Breaking] Body attribute modified: energie
```
> You can create as many diffs as you like without being authenticated. This is a **free and unlimited service** provided you have a fair use of the service.
{: .info}

_Note: You can also test this feature in our dedicated web application at <https://api-diff.io/>._

#### Authenticated diffs related to your Bump.sh documentation

From an existing Bump.sh documentation, the `diff` command will retrieve a comparison changelog between your latest published documentation and the given file or URL:

```shell
bump diff path/to/your/file.yml --doc my-documentation --token $DOC_TOKEN
```

If you want to compare two unpublished versions of your API document, the `diff` command can retrieve a comparison changelog between two given file or URL, “as simple as `git diff`”:

```shell
bump diff path/to/your/file.yml path/to/your/next-file.yml --doc my-documentation --token $DOC_TOKEN
```

Please check `bump diff --help` for full usage details.

### `bump preview [FILE]`


When writing a documentation, you might want to preview how it renders on Bump.sh. This is exactly the goal of the `preview` command: it will create a temporary documentation with a unique URL, which will be available for a short period of time.

Usage from a local OpenAPI or AsyncAPI file

```shell
bump preview path/to/file.json
```

You can also preview a file available from a URL

```shell
bump preview https://developers.bump.sh/source.yaml
```

#### Live preview

By using the `--live` flag you can stay focused on API design (OpenAPI or AsyncAPI file) while seeing a continuously updated preview each time you save your API document.

- Launch the live preview command in your terminal

```shell
bump preview --live --open openapi-definition.json
```

- Edit your `openapi-definition.json` file in your favorite text editor
- Watch the live preview being updated each time your save your file!

> You can create as many previews as you like without being authenticated. This is a **free and unlimited service**.
{: .info}

_Note: the additional `--open` flag helps to automatically open the preview URL in your browser._

Please check `bump preview --help` for more usage details

## Compatible specification types

We currently support [OpenAPI](https://github.com/OAI/OpenAPI-Specification) from 2.0 (called Swagger) to 3.1 and [AsyncAPI 2.x](https://www.asyncapi.com/docs/reference/specification/latest) specification file types. Both YAML or JSON file formats are accepted file inputs to the CLI.

## Contributing

Bug reports and pull requests are welcome on GitHub at <https://github.com/bump-sh/cli>. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The Bump CLI project is released under the [MIT License](http://opensource.org/licenses/MIT).
