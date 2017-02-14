# toki
> a configuration based orchestration rule engine with a growing ecosystem of modules and plugins that allows greater flexibility and support  of a myriad of technologies  

<!-- Badges Go Here -->
[![npm version](https://badge.fury.io/js/%40toki%2Ftoki.svg)](https://badge.fury.io/js/%40toki%2Ftoki)
[![Build Status](https://travis-ci.org/xogroup/toki.svg?branch=master)](https://travis-ci.org/xogroup/toki)
[![Known Vulnerabilities](https://snyk.io/test/github/xogroup/toki/badge.svg)](https://snyk.io/test/github/xogroup/toki)
[![NSP Status](https://nodesecurity.io/orgs/xo-group/projects/ce9f9a2f-7ab5-4b13-ab8d-a3401eb0c00f/badge)](https://nodesecurity.io/orgs/xo-group/projects/ce9f9a2f-7ab5-4b13-ab8d-a3401eb0c00f)

Lead Maintainer: [Cesar Hernandez](https://github.com/cesarhq)

## Introduction



## Installation
```
npm install toki
```

## Plugins

### toki-logger

### toki-config

More on [toki-config](https://github.com/xogroup/toki-config)


### toki-logger

A logging interface that can be instantiated with any standard logging library. 
__toki__ will require the toki-logger instance to log events and actions related to it's own lifecycle and request execution.

```
//setup logger
const winston = require('winston');
const TokiLogger = require('toki-logger');
const logger = TokiLogger(winston);

//setup 
const toki = require('toki-hapi-bridge');

```

More on [toki-logger](https://github.com/xogroup/toki-logger)

## Usage



## API

See the [API Reference](http://github.com/xogroup/toki/blob/master/API.md).

### Examples

Check out the [Examples](http://github.com/xogroup/toki/blob/master/Examples.md).

## Contributing

We love community and contributions! Please check out our [guidelines](http://github.com/xogroup/toki/blob/master/.github/CONTRIBUTING.md) before making any PRs.

## Setting up for development

Getting yourself setup and bootstrapped is easy.  Use the following commands after you clone down.

```
npm install && npm test
```
