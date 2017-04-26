# Toki

> A configuration based orchestration rules engine that's protocol agnostic.  

<!-- Badges Go Here -->
[![npm version](https://badge.fury.io/js/toki.svg)](https://badge.fury.io/js/toki)
[![Build Status](https://travis-ci.org/xogroup/toki.svg?branch=master)](https://travis-ci.org/xogroup/toki)
[![Known Vulnerabilities](https://snyk.io/test/github/xogroup/toki/badge.svg)](https://snyk.io/test/github/xogroup/toki)
[![NSP Status](https://nodesecurity.io/orgs/xo-group/projects/033de8be-f1dc-447b-98fd-09fbab416886/badge)](https://nodesecurity.io/orgs/xo-group/projects/033de8be-f1dc-447b-98fd-09fbab416886)

Lead Maintainer: [Cesar Hernandez](https://github.com/cesarhq)

## Introduction

Toki is an orchestration layer for microservice based architectures. It is both HTTP server agnostic, and downstream protocol agnostic. It's configuration based and allows you to bring your own logger.

### Key Features

+ *Configuration based* using version-able JSON files. Easy to write, easy to deploy.

+ *Bring your own HTTP framework* so you can use Express, Koa, Hapi or whatever else floats your boat.

+ *Protocol Agnostic* so you can speak whatever your microservices are speaking. HTTP, RabbitMQ, etc.

+ *Supports any standard logger* so you can plug it into your existing log setup.

## Getting Started

To allow Toki to be used by any http framework, Toki uses small modules we call 'bridges'. The bridge appropriate for your webserver framework is where you should start:

+ [Hapi](https://github.com/xogroup/toki-hapi-bridge)

_Don't see a bridge you need? Please feel free to contribute one. Bridges are easy to write, we promise!_

You can also peek at our [reference implementation](https://github.com/xogroup/toki-reference), which provides a fully setup and ready to roll Toki implementation out of the box that's heavily commented and explained.

## API

See the [API Reference](http://github.com/xogroup/toki/blob/master/API.md).

We also have guides on how to build your very own:

[Toki configuration](./RULESENGINE.md#configuration)

[Toki action handler](./RULESENGINE.md#how-to-implement-my-very-own-action-handler)

### Examples

Check out the [Examples](http://github.com/xogroup/toki/blob/master/Examples.md).

## Contributing

We love community and contributions! Please check out our [guidelines](http://github.com/xogroup/toki/blob/master/.github/CONTRIBUTING.md) before making any PRs.

### Setting up for development

Getting yourself setup and bootstrapped is easy.  Use the following commands after you clone down.

```
npm install
npm test
```
