<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [toki](#toki)
  - [Introduction](#introduction)
    - [Key Features](#key-features)
  - [Installation](#installation)
  - [API](#api)
  - [Dependencies](#dependencies)
    - [toki-config](#toki-config)
    - [toki-logger](#toki-logger)
  - [Usage](#usage)
    - [Examples](#examples)
  - [Contributing](#contributing)
  - [Setting up for development](#setting-up-for-development)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# toki
> a configuration based orchestration rule engine with a growing ecosystem of modules and plugins that allows greater flexibility and support  of a myriad of technologies.  

<!-- Badges Go Here -->
[![npm version](https://badge.fury.io/js/toki.svg)](https://badge.fury.io/js/toki)
[![Build Status](https://travis-ci.org/xogroup/toki.svg?branch=master)](https://travis-ci.org/xogroup/toki)
[![Known Vulnerabilities](https://snyk.io/test/github/xogroup/toki/badge.svg)](https://snyk.io/test/github/xogroup/toki)
[![NSP Status](https://nodesecurity.io/orgs/xo-group/projects/ce9f9a2f-7ab5-4b13-ab8d-a3401eb0c00f/badge)](https://nodesecurity.io/orgs/xo-group/projects/ce9f9a2f-7ab5-4b13-ab8d-a3401eb0c00f)

Lead Maintainer: [Cesar Hernandez](https://github.com/cesarhq)

## Introduction

Everybody is riding the hype around **Microservices Architecture**, which makes sense until you realize you end up with several microservices that need to be coordinated to fulfil your business requirements.
  
Enter __toki__ and it's ecosystem of modules/plugins which was born on the aforementioned necessity.
 
 
### Key Features

- __Configuration based__, bring your own modules implemeting your own business logic, install them, add them to the configuration an watch do their thing.
 
- __Web servers__, by using the different __toki-bride__ implementations you can use your favorite web server and integrate __toki__ into it.

## Installation

```
npm install toki
```

## API

See the [API Reference](http://github.com/xogroup/toki/blob/master/API.md).

## Dependencies

### toki-config

Main interface to obtain rules configuration to be executed by __toki__.  

```Javascript
//setup config
const TokiConfig = require('toki-cofig');
//I need file based config based
const tokiConfig = new TokiConfig({
    'toki-config-file' : {
        path : './config.json'
    }
});

//setup toki
const Toki = require('toki');
const toki = new Toki();
```

More on [toki-config](https://github.com/xogroup/toki-config).


### toki-logger

A logging interface that can be instantiated beforehand with any standard logging library. 
__toki__ will require the toki-logger instance to log events and actions related to it's own lifecycle and request/rule execution.

```Javascript
//setup logger
const winston = require('winston');
const TokiLogger = require('toki-logger');
const logger = TokiLogger(winston);

//setup toki
const Toki = require('toki');
const toki = new Toki();
```

More on [toki-logger](https://github.com/xogroup/toki-logger).

## Usage

Code wise there's not a lot todo in regards to __toki__. The main concerns for you would be:

- put together your configuration as per [toki configuration](./RULESENGINE.md#configuration)

- build your action handler as per [toki action handler](./RULESENGINE.md#how-to-implement-my-very-own-action-handler) listed steps

- setup __toki__ dependencies

- require and new __toki__

- sit back and relax skynet err.. __toki__ is at the wheel

```Javascript
//setup config
const TokiConfig = require('toki-cofig');
//I need file based config based
const tokiConfig = new TokiConfig({
    'toki-config-file' : {
        path : './config.json'
    }
});

//setup logger
const winston = require('winston');
const TokiLogger = require('toki-logger');
const logger = TokiLogger(winston);

//setup toki
const Toki = require('toki');
const toki = new Toki();
```

### Examples

Check out the [Examples](http://github.com/xogroup/toki/blob/master/Examples.md).

## Contributing

We love community and contributions! Please check out our [guidelines](http://github.com/xogroup/toki/blob/master/.github/CONTRIBUTING.md) before making any PRs.

## Setting up for development

Getting yourself setup and bootstrapped is easy.  Use the following commands after you clone down.

```
npm install && npm test
```
