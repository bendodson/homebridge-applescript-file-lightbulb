var Service;
var Characteristic;

var applescript = require('applescript');

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory('homebridge-applescript-file-lightbulb', 'ApplescriptFileLightbulb', ApplescriptAccessory);
}

function ApplescriptAccessory(log, config) {
	this.log = log;
	this.service = 'Switch';
	this.name = config['name'];
	this.onCommand = config['on'];
	this.offCommand = config['off'];
	this.brightnessCommand = config['brightness'];
}

ApplescriptAccessory.prototype.setState = function(powerOn, callback) {
	var accessory = this;
	var state = powerOn ? 'on' : 'off';
	var prop = state + 'Command';
	var command = accessory[prop];

	if (command.length == 0) {
		return;
	}

	applescript.execFile(command, done);

	function done(err, rtn) {
		if (err) {
			accessory.log('Error: ' + err);
			callback(err || new Error('Error setting ' + accessory.name + ' to ' + state));
		} else {
			accessory.log('Set ' + accessory.name + ' to ' + state);
			callback(null);
		}
	}
}

ApplescriptAccessory.prototype.setBrightness = function(level, callback) {
	var accessory = this;
	var command = accessory['brightnessCommand'];
	if (command.length == 0) {
		return;
	}

	applescript.execFile(command, [level], done);

	function done(err, rtn) {
		if (err) {
			accessory.log('Error: ' + err);
			callback(err || new Error('Error setting ' + accessory.name + ' to ' + level));
		} else {
			accessory.log('Set ' + accessory.name + ' to ' + level);
			callback(null);
		}
	}
}

ApplescriptAccessory.prototype.getServices = function() {
	var informationService = new Service.AccessoryInformation();
	var lightbulbService = new Service.Lightbulb(this.name);

	informationService
		.setCharacteristic(Characteristic.Manufacturer, 'Applescript Manufacturer')
		.setCharacteristic(Characteristic.Model, 'Applescript Model')
		.setCharacteristic(Characteristic.SerialNumber, 'Applescript Serial Number');

	lightbulbService
		.getCharacteristic(Characteristic.On)
		.on('set', this.setState.bind(this));

	lightbulbService
            .addCharacteristic(Characteristic.Brightness)
            .on('set', this.setBrightness.bind(this));

	return [lightbulbService];
}