// Expose some functionality globally.
globals = {
	Builder:       require('models/builder'),
	BuilderView:   require('views/builder'),
	ModuleFactory: require('utils/module-factory'),
};

module.exports = globals;
