# 1.0.0 API Reference

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [toki](#toki)
  - [new Toki(options)](#new-tokioptions)
  - [getInstance()](#getinstance)
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

- `options` - required object.

    - `router` - required __toki-bridge__ router object to be setup with configured routes.


```javascript
const bridge = require('toki-hapi-bridge');
const Toki = require('toki');
const toki = new Toki({
    router : bridge
});
```

### getInstance()
[static method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static) - If a __toki__ instance was already created with `new Toki` it will return that instance otherwise will throw an error.

happy path:

```javascript
const bridge = require('toki-hapi-bridge');
const Toki = require('toki');
const toki = new Toki({
    router : bridge
});

//rejoice
const sameTokiInstance = Toki.getInstance();

```

not so happy here:

```javascript
const Toki = require('toki');

//tears rolling down my face ater error gets thrown
const notMyToki = Toki.getInstance();

```


### events

#### ready

Once __toki__ has been instantiated it will immediately require __toki-config__ to retrieve the configuration and prepare itself to configure routes and action handlers.

```Javascript
//intantiate toki
const Toki = require('toki');
const toki = new Toki({
    router : routerInstance
});

//wait for toki to be ready
toki.on('ready', ()=>{
    //toki is open for buisness (aka do your thing)    
});

```

#### error

Fired if any error occurred during the initialization phase.

```Javascript
//instantiate toki
const Toki = require('toki');
const toki = new Toki({
    router : routerInstance
});

//check if toki erroeed out
toki.on('error', (error)=>{
    //check error to find out what happened    
});

```

#### config.changed

__toki__ subscribes to events triggered by __toki-config__ if the underlaying configuration mechanism detects a configuration change. __toki__ will bubble up the event for the __toki__ instantiatior to act accordingly in response to the event.

```Javascript
//instantiate toki
const Toki = require('toki');
const toki = new Toki({
    router : routerInstance
});

//wait for toki to be ready
toki.on('config.changed', ()=>{
    //toki is open for business (aka do your thing)    
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
