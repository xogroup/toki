# Examples

Here's a BIG BEAUTIFUL example showing all __toki__ pieces working together.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [myapp.js](#myappjs)
- [myConfig.json](#myconfigjson)
- [toki-method-product-lookup module](#toki-method-product-lookup-module)
- [toki-method-inventory-lookup-central module](#toki-method-inventory-lookup-central-module)
- [toki-method-inventory-lookup-east module](#toki-method-inventory-lookup-east-module)
- [toki-method-inventory-lookup-west module](#toki-method-inventory-lookup-west-module)
- [toki-method-product-backorder module](#toki-method-product-backorder-module)
- [toki-method-product-map module](#toki-method-product-map-module)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### myapp.js

```javascript
//setup config
const TokiConfig = require('toki-cofig');
//I need file based config based
const tokiConfig = new TokiConfig({
    'toki-config-file' : {
        path : './myConfig.json'
    }
});

//setup logger
const winston = require('winston');
const TokiLogger = require('toki-logger');
const logger = TokiLogger(winston);


//setup bridge 
const bridge = require('toki-hapi-bridge');
server = new Hapi.Server();


//setup toki
const Toki = require('toki');
const toki = new Toki({
    router : bridge
});
```


### myConfig.json

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
                     "type": "toki-method-inventory-lookup-central",
                     "description" : "lookup product inventory in central region"                 
                 },
                 {                    
                     "name": "inventory-east",
                     "type": "toki-method-inventory-lookup-east",
                     "description" : "lookup product inventory in east region"                 
                 },
                 {                    
                     "name": "inventory-west",
                     "type": "toki-method-inventory-lookup-west",
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


### toki-method-product-lookup module

```javascript
module.exports = function(context){

    //get productId
    const productId = context.request.params.id; 

    //return promise
    return  callProductApi(productId)
        .then((result)=>{       
            //check for response payload and return it
            
            return result;
        });    
    //let error bubble up do NOT catch toki will handle it for you    
};
```
### toki-method-inventory-lookup-central module

```javascript
module.exports = function(context){

    //get productId
    const productId = this.product.id;
    const locationId = "central";

    //return promise
    return  callInventoryApi(productId, locationId)
        .then((result)=>{       
            //check for response payload and return it
            
            return result;
        });    
    //let error bubble up do NOT catch toki will handle it for you    
};
```

### toki-method-inventory-lookup-east module

```javascript
module.exports = function(context){

    //get productId
    const productId = this.product.id;
    const locationId = "east";

    //return promise
    return  callInventoryApi(productId, locationId)
        .then((result)=>{       
            //check for response payload and return it
            
            return result;
        });    
    //let error bubble up do NOT catch toki will handle it for you    
};
```

### toki-method-inventory-lookup-west module

```javascript
module.exports = function(context){

    //get productId
    const productId = this.product.id;
    const locationId = "west";

    //return promise
    return  callInventoryApi(productId, locationId)
        .then((result)=>{       
            //check for response payload and return it
            
            return result;
        });    
    //let error bubble up do NOT catch toki will handle it for you    
};
```

### toki-method-product-backorder module

```javascript
module.exports = function(context){

    //get productId
    const productId = context.request.params.id;
    
    //add up inventory from all locations, if you want to get fancy check for object existance    
    let inventory = 0;
    ['inventory-central', 'inventory-west', 'inventory-east'].forEach((location)=>{
           if (this[location] && this[location].inventory){
               inventory += this[location].inventory;
           }        
    });
    
    //return promise
    return  callBackoderApi(productId, inventory)
        .then((result)=>{       
            //check for response payload and return it
            
            return {
                backorder : result,
                inventory : inventory
            };
        });    
    //let error bubble up do NOT catch toki will handle it for you    
};
```

### toki-method-product-map module

```javascript
module.exports = function(context){

    //grab product and inventory and send back to client
    context.response ({
        product : this.product,
        inventory : this.backorder.inventory
    });
};
```
