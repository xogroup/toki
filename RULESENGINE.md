# toki rules engine

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [configuration](#configuration)
  - [routes](#routes)
    - [route](#route)
  - [actions](#actions)
    - [action](#action)
    - [parallel actions](#parallel-actions)
  - [failure](#failure)
- [schema](#schema)
- [Action Handler Contract](#action-handler-contract)
  - [Context](#context)
  - [method](#method)
    - [returning an object](#returning-an-object)
    - [returning a promise](#returning-a-promise)
  - [error handling](#error-handling)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## configuration

__toki__ was conceived as configuration based rule engine where your configuration dictates how your routes are composed and executed by different steps.

let's take a look at the different pieces that make a toki configuration.


 ```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup"
             },
             {
                 "name": "inventory",
                 "type": "toki-method-inventory-lookup"
             }
         ],
         "failure"   : [
             {
                 "name": "rollback",
                 "type": "toki-method-rollback"
             }
         ]
     }
  ]
}
 ```

### routes

An array of [route](#route) objects.

#### route

 - `url` - partial http url including params in the style of __toki-bridge__ being used.

    url : 'product/{id}'

 - `httpAction` - http verb to be used on the route. allowed values 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'.

 - `tags` - TODO

 - `description` - a description of your route purpose in case you forget it.

 - `actions` - array of [actions](#actions).

 ```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "description" : "Lookup up products by id",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup"
             }
         ]
     },
     {
         "path"      : "/products/",
         "httpAction": "POST",
         "description" : "Create a product",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-create"
             }         
         ]     
     }
  ]
}
 ```

### actions

An array of [action](#action) rules to be executed in sequential order.


 ```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {
                 "name": "product",
                 "type": "toki-method-product-lookup",
                 "description" : "lookup product catalog"
             },
             {
                 "name": "inventory",
                 "type": "toki-method-inventory-lookup",
                 "description" : "lookup product inventory"
             },
             {
                 "name": "backorder",
                 "type": "toki-method-product-backorder",
                 "description" : "check if product inventory is below limit and initiate backorder"
             },
             {
                 "name": "map",
                 "type": "toki-method-product-lookup",
                 "description" : "compose reponse payload with product description and inventory"
             }
         ]
     }
  ]
}
 ```

#### action

- `name` - name of the action to be executed. action name will be used to bind the action response to the execution context, that way subsequent actions will be able to use the previos action response, say what?
 let's take a deep breath and try to explain this nonsense:


 ```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup",
                 "description" : "lookup product catalog",
                 "options" : {
                    "url" : "http://product/"
                 }
             },
             {                    
                 "name": "inventory",
                 "type": "toki-method-inventory-lookup",
                 "description" : "lookup product inventory",               
                 "options" : {
                    "url" : "http://inventory/",
                    "locations" : ["East", "West", "Central"]
                 }
             },
             {                    
                 "name": "backorder",
                 "type": "toki-method-product-backorder",
                 "description" : "check if product inventory is below limit and initiate backorder"                 
             },
             {                    
                 "name": "map",
                 "type": "toki-method-product-lookup",
                 "description" : "compose reponse payload with product description and inventory"                 
             }                         
         ]
     }
 ]
}
 ```

1. action `product` executes result gets bound into the [execution context](#xecution-context) as `this['product'] = result`.
2. action `inventory` executes and has access to `this['product']`, it's own result gets bounded to [execution context](#xecution-context) as `this['inventory']`.
3. action `backorder` executes and has access to `this['product']` and `this['inventory']`, it's own result gets bounded to [execution context](#xecution-context) as `this['backorder']`.
4. action `map` executes and access all previous results `this['product']`, `this['inventory']`, `this['backorder']`, and combines them into an new object that will be passed to `this.resppnse(newObj)` to be sent back to a happy client.

- `type` - this determines the [action handler](#action-handler) node module to be required and invoked as part of the execution.

`type` is free form but we suggest our standard naming convention of pre-appending `toki-method-` to your action handler name.

 ```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup",
                 "description" : "lookup product catalog",
                 "options" : {
                    "url" : "http://product/"
                 }
             }             
         ]
     }
  ]
}
```

On the previous configuration `toki-method-product-lookup` will be invoked as `require('toki-method-product-lookup')`


- `description` - write something nice about your action.

- `options` - optional. Configuration object to be passed to the action executor.

#### parallel actions

if your action is an array of [action](#action) objects, those will be executed in parallel and wait for all actions to finish before continuing with the next action in the execution process.

Clear as mud right? this code example will be crystal clear to our nerdy readers:


 ```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup",
                 "description" : "lookup product catalog"
             },
             [
                 {                    
                     "name": "inventory-central",
                     "type": "toki-method-inventory-lookup-location-central",
                     "description" : "lookup product inventory in central region"                 
                 },
                 {                    
                     "name": "inventory-east",
                     "type": "toki-method-inventory-lookup-location-east",
                     "description" : "lookup product inventory in east region"                 
                 },
                 {                    
                     "name": "inventory-west",
                     "type": "toki-method-inventory-lookup-location-west",
                     "description" : "lookup product inventory in west region"                 
                 }
             ],
             {                    
                 "name": "backorder",
                 "type": "toki-method-product-backorder",
                 "description" : "check if product inventory is below limit and initiate backorder"                 
             },
             {                    
                 "name": "map",
                 "type": "toki-method-product-map",
                 "description" : "compose reponse payload with product description and inventory"                 
             }                         
         ]
     }
  ]
}
 ```


 1. action `product` executes.
 2. actions `inventory-central`, `inventory-easr`, `inventory-west` execute in parallel and wait for all 3 actions fo finish execution.
 3. action `backorder` executes.
 4. action `map` executes.
 
### failure

An array of [action](#action) rules to be executed in sequential order. These failure rules are executed if one or more rule from the `"actions"` ruleset error out.

The failure rules are executed identically the same as [action](#action) rules, with the sole exception being that an additional property `errors` is added to the parameter passed to the toki-method handler.

An error in the `"failure"` ruleset will result in a 500 Server Error response being sent.

```json
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup",
                 "description" : "lookup product catalog"
             },
             {                    
                 "name": "inventory",
                 "type": "toki-method-inventory-lookup",
                 "description" : "lookup product inventory"                 
             },
             {                    
                 "name": "backorder",
                 "type": "toki-method-product-backorder",
                 "description" : "check if product inventory is below limit and initiate backorder"                 
             },
             {                    
                 "name": "map",
                 "type": "toki-method-product-lookup",
                 "description" : "compose reponse payload with product description and inventory"                 
             }                         
         ],
         "failure"   : [
             {
                  "name": "rollback",
                  "type": "toki-method-rollback",
                  "description": "roll back any changes triggered in unsuccessful 'actions'"
             }
         ]
     }
  ]
}
 ```

## schema

__toki__ uses the following [joi](https://github.com/hapijs/joi) schema to validate the configuration returned by __toki-config__. Better get your configuration right or __toki__ will throw a very friendly joi error.

```Javascript
const action  = Joi.object().keys({
    name       : Joi.string(),
    type       : Joi.string(),
    description: Joi.string().optional().allow(null, ''),
    options    : Joi.object().optional().allow(null)
});
const actions = Joi.array().items(action).min(2);
const routes  = Joi.object().keys({
    path       : Joi.string(),
    httpAction : Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    tags       : Joi.array().items(Joi.string()).min(1).optional(),
    description: Joi.string().optional().allow(null, ''),
    actions    : Joi.array().items(action, actions).min(1)
});
const schema  = Joi.object().keys({
    routes: Joi.array().items(routes).min(1)
}).label('toki configuration');
```


## Action Handler Contract

### Context

Most features available to methods exist in the context of that action. `this` will refer to your context. The context looks as such:
```javascript
    {
        server: {
            request //http request defined above and by the bridge,
            response //http response defined above and by the bridge
        },
        action //the configuration block for the action
        contexts: { //This is a pathway to allow you to see the contexts of other actions
            other-action-1,
            other action-2
        }
    }
```

An example configuration block available under `this.action`:
```javascript
{
    "action" : {                    
        "name": "inventory-central",
        "type": "toki-method-inventory-lookup-location-central",
        "description" : "lookup product inventory in central region"                 
    },
    "request" : {},
    "response" : {}   
}
```

### method

A method it's just a fancy name for a node module that exports a function that either returns a value or a promise that fulfills into a value, simple as that. When that method is invoked in a flow config by an action, that particular instance of it is called an "action handler".

Our standard naming convention for a method is prefixing it with `toki-method-*` such as `toki-method-http` or `toki-method-proxy`.

Your action handler won't be "newable", but it will be bound to a new context every time it's called as defined in the above section.

Any exceptions you throw will be handled gracefully by toki.

Sample config:

 ```javascript
{
 "routes": [
     {
         "path"      : "/products/{id}",
         "httpAction": "GET",
         "actions"   : [
             {                    
                 "name": "product",
                 "type": "toki-method-product-lookup",
                 "description" : "lookup product catalog",
                 "options" : {
                    "url" : "http://product/"
                 }
             }             
         ]
     }
  ]
}
```

 `toki-method-product-lookup` module will be required as

 ```javascript

//require without instantiation
const actionHandler = require('toki-method-product-lookup');
```


#### returning an object

```javascript
module.exports = function(context) {

    //access request header
    const headers = context.request.headers;

    //do your thing;

    //write something to the response object
    context.response({
      key : 'value'        
    });

    //and yet return something for next action to enjoy            
    return {
      key : 'value'
    };
}
```

#### returning a promise

```javascript
//we all love bluebird
const Promise = require('bluebird');

module.exports = function(context) {

    //clone context and create my own so I can add my stuff
    const newContext = Object.assign({}, context);

    return Promise.resolve()
        .bind(newContext)
        .then(someAsyncStuff)
        .then((result)=>{
            return result;
        });
}
```

### error handling

When fulfilling a route request __toki__ will guard against uncuaght errors and will fail gracefuly sending a [BOOM 500 error](https://github.com/hapijs/boom#boombadimplementationmessage-data---alias-internal).

As a general rule avoid handling errors in your action handler unless that's part of your business logic, don't turn down the freebie __toki__ gives you/
