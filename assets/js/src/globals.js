// Expose some functionality globally.
var globals = {
	Builder:       require('models/builder'),
	BuilderView:   require('views/builder'),
	ModuleFactory: require('utils/module-factory'),
};

module.exports = globals;
