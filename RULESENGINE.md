# toki rules engine

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Configuration](#configuration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Configuration



__toki__ uses a Joi schema to validate the configuration returned by __toki-config__

```Javascript
const action  = Joi.object().keys({
    name       : Joi.string(),
    type       : Joi.string(),
    description: Joi.string().optional()
});
const actions = Joi.array().items(action).min(2);
const routes  = Joi.object().keys({
    path       : Joi.string(),
    httpAction : Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    tags       : Joi.array().items(Joi.string()).min(1).optional(),
    description: Joi.string().optional(),
    actions    : Joi.array().items(action, actions).min(1)
});
const schema =  Joi.object().keys({
    routes: Joi.array().items(routes).min(1)
}).label('toki configuration');

```

example configuration

```json
 {
    "routes": [
        {
            "path"      : "/products",
            "httpAction": "GET",
            "actions"   : [
                {
                    "name": "validate",
                    "type": "product-catalog"
                },
                {
                    "name": "inventory",
                    "type": "product-inventory"
                },
                {
                    "name": "action3",
                    "type": "action-handler3"
                }
            ]
        },
        {
            "path"      : "/product",
            "httpAction": "POST",
            "actions"   : [
                {
                    "name": "action4",
                    "type": "action-handler4"
                },
                {
                    "name": "action5",
                    "type": "action-handler5"
                },
                {
                    "name": "action6",
                    "type": "action-handler6"
                }
            ]
        }
    ]
}
```
