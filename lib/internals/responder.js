'use strict';

const Joi = require('joi');
const Templater = require('toki-templater');

const responderConfigSchema = Joi.object().keys({
    statusCode: Joi.alternatives().try([
        Joi.string(),
        Joi.number()
    ]).required(),
    payload: Joi.alternatives().try([
        Joi.string(),
        Joi.object()
    ]).optional()
});

module.exports = function () {

    const self = this;

    if (!self.config.clientResponseConfiguration) {
        throw new Error('responder action configuration must include response mapping configs');
    }

    const validConfig = responderConfigSchema.validate(self.config.clientResponseConfiguration);

    if (validConfig.error) {
        throw validConfig.error;
    }

    return Templater(self.config.clientResponseConfiguration, null, {
        context: self.contexts
    })
        .then((responseData) => {

            self.server.response.code(parseInt(responseData.statusCode));

            return responseData.payload ?
                self.server.response.send(responseData.payload) :
                self.server.response.send();
        });
};
