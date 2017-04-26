# Examples

These examples primarily focus on Toki bridges, methods and configs. To see examples of Toki in action, please check out the [Toki Reference Implementation](https://github.com/xogroup/toki-reference)
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Sample Config (configs/default.json)](#sample-config-configsdefaultjson)
  - [Example toki-method-product-lookup module](#example-toki-method-product-lookup-module)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Sample Config (configs/default.json)

Here's a full sample config for the theoretical example of looking up a product. Notice that our multi-region lookup section is nested in an array, indicating to Toki that these actions can be done in parallel.

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
                        "description": "lookup product inventory in central region",
                        "type": "toki-method-http",
                        "inputConfiguration": {
                            "url": "http://central.product.com",
                            "headers": {"Authorization": "abc123"}
                        }            
                    },
                    {                    
                        "name": "inventory-east",
                        "type": "toki-method-http",
                        "inputConfiguration": {
                            "url": "http://east.product.com",
                            "headers": {"Authorization": "abc123"}
                        }      
                    },
                    {                    
                        "name": "inventory-west",
                        "type": "toki-method-http",
                        "inputConfiguration": {
                            "url": "http://west.product.com",
                            "headers": {"Authorization": "abc123"}
                        }              
                    }
                ],
                {                    
                    "name": "backorder",  
                    "type": "toki-method-http",
                    "inputConfiguration": {
                        "url": "http://backorder.product.com",
                        "headers": {"Authorization": "abc123"}
                    }           
                },
                {                    
                    "name": "map",
                    "type": "toki-method-http",
                    "inputConfiguration": {
                        "url": "http://map.product.com",
                        "headers": {"Authorization": "abc123"},
                        "payload": {
                            "central": "{{output.inventory-central.response}}",
                            "east": "{{output.inventory-east.response}}",
                            "west": "{{output.inventory-west.response}}"
                        },
                        "clientResponseConfiguration": true
                    }           
                }                         
            ]
        }
    ]
}
```


### Example toki-method-product-lookup module

```javascript
module.exports = function(){

    //get productId
    const productId = this.server.request.params.id;

    //return promise
    return  callProductApi(productId)
        .then((result)=>{       
            //check for response payload and return it

            return result;
        });    
    //We don't need a catch here for errors because Toki will handle them correctly
};
```
