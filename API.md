# 1.0.0 API Reference

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [toki](#toki)
  - [new Toki(options)](#new-tokioptions)
  - [events](#events)
    - [ready](#ready)
    - [error](#error)
    - [config.changed](#configchanged)
  - [Contracts](#contracts)
    - [Request](#request)
    - [Response](#response)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## toki


### new Toki(options)

Creates a singleton instance of __toki__ and starts the bootstrapping process.

+ `options` __required__ At minimum, a router is required. In most cases you only need to initialize the bridge itself, which in turn will setup Toki for you. Toki accepts the following:

    + `router` A configured bridge
    + `logger` An optional logger to make use of. Should expose log4j style methods (`error`, `warn`, `info`, `debug`, `trace`)


### events

#### ready

Fired when __toki__ is ready.

```Javascript
//intantiate toki
const Toki = require('toki');

toki.on('ready', ()=>{
    //Ready  
});

```

#### error

Fired for errors.

```Javascript
//instantiate toki
const Toki = require('toki');

toki.on('error', (error)=>{
    //check error to find out what happened    
});

```

#### config.changed

__toki__ subscribes to events triggered by __toki-config__ if the underlaying configuration mechanism detects a configuration change. __toki__ will bubble up the event.

```Javascript
//instantiate toki
const Toki = require('toki');

toki.on('config.changed', ()=>{

});

```

### Contracts
_Fulfilled by the Bridge_

These contracts supply a minimum. Additional properties or methods may exist, but should not be used since requests and responses provided by the bridge are often decorated versions of underlying requests or responses.

#### Request

Request is a decorated version of the Node http-server request object. It will always have the following:

+ `request.query` - a parsed query object
+ `request.params` - an object of any params from passed paths
+ `request.path` - the current path
+ `request.method` - the method which called this request
+ `request.headers` - an object containing all headers


#### Response

Response is an object which allows you to send data back to the client as well as set status codes, headers and return errors.

+ `response.send(payload)` where payload is a string, an object or a promise. If payload is an instance of error, it'll be sent to response.error().
+ `response.error(error)` where payload is an instance of error will send back a default status code as well as show the error.
+ `response.code(status)` where status is a number will send back that statusCode. It can be called before or after send().
+ `response.header(name, value)` will set the named header to the new value. It can be called before or after send().
