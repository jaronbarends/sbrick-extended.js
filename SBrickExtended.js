/*
 * Copyright (c) 2017 Jarón Barends
 *
 * @author Jarón Barends
 * @website jaron.nl
 *
 * Child-class of sbrick.js with some additional functionality
 *
 * Requires sbrick.js, bluetooth.js and promise-queue library
 * https://github.com/360fun/sbrick.js
 * https://github.com/360fun/bluetooth.js
 * https://github.com/azproduction/promise-queue
 *
 * This code is compatible with SBrick Protocol 4.17
 * https://social.sbrick.com/wiki/view/pageId/11/slug/the-sbrick-ble-protocol
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let SBrickExtended = (function() {
	'use strict';

	// Start general stuff that's equal for all instances, and that doesn't need to be exposed to outside world

		/**
		* servo motor only supports 7 angles per 90 degrees
		* and these angles do not correspond linearly with power values
		* for every supported angle:
		*	angle: the angle in degrees
		*	powerMin: the minimum power value that rotates the servo motor to this angle
		*	powerMax: the maximum power value that rotates the servo motor to this angle
		*	power: a value somewhere between min and max, so we're sure we're in the right range
		*/
		const powerAngles = [
			{ angle: 0, power: 0, powerMin: 0, powerMax: 0},
			{ angle: 13, power: 10, powerMin: 1, powerMax: 19},
			{ angle: 26, power: 40, powerMin: 20, powerMax: 52},
			{ angle: 39, power: 70, powerMin: 53, powerMax: 83},
			{ angle: 52, power: 100, powerMin: 84, powerMax: 116},
			{ angle: 65, power: 130, powerMin: 117, powerMax: 145},
			{ angle: 78, power: 160, powerMin: 146, powerMax: 179},
			{ angle: 90, power: 200, powerMin: 180, powerMax: 255}
		];


		const MAX = 255;// copy of sbrick.js MAX value - we need this in general helper functions
		const MAX_QD = 127;// copy of sbrick.js MAX_QD value - we need this in general helper functions
		const MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK = 98;// somehow, motor does not seem to work for power values < 98



		/**
		* translate servo's angle to corresponding power-value
		* @param {number} angle - The angle of the servo motor
		* @returns {number} The corresponding power value (0-255)
		*/
		const _servoAngleToPower = function(angle) {
			// servo motor only supports 7 angles per 90 degrees, i.e. increments of 13 degrees
			angle = parseInt(angle, 10);
			const idx = Math.round(angle/13);
			let power = powerAngles[idx].power;

			return power;
		};


		/**
		* translate servo's power to corresponding angle-value
		* @param {number} power - The current power (0-255) of the servo motor
		* @returns {number} The corresponding angle value
		*/
		const _servoPowerToAngle = function(power) {
			let angle = 0;
			power = parseInt(power, 10);
			for (let i=0, len=powerAngles.length; i<len; i++) {
				const obj = powerAngles[i];
				if (power === obj.power) {
					angle = obj.angle;
					break;
				}
			}

			return angle;
		};


		/**
		* drive motor does not seem to work below certain power threshold value
		* translate the requested percentage to the actual working power range
		* @param {number} powerPerc - The requested power as percentage
		* @returns {number}	- A value within the acutal power range
		*/
		const _drivePercentageToPower = function(powerPerc) {
			let power = 0;
			if (powerPerc !== 0) {
				// define the power range within which the drive does work
				const powerRange = MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
				power = Math.round(powerRange * powerPerc/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);
			}

			return power;
		};


		/**
		* drive motor does not seem to work below certain power threshold value
		* translate the actual power in the percentage within the actual working power range
		* @returns {number} - The percentage within the actual power range
		*/
		const _drivePowerToPercentage = function(power) {
			// define the power range within which the drive does work
			let powerPerc = 0;
			if (power !== 0) {
				const powerRange = MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK,
					relativePower = power - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
				powerPerc = Math.round(100 * relativePower / powerRange);
			}

			return powerPerc;
		};



		/**
		* get interpretation for a sensor value, depending on the kind of sensor
		* @returns {string} Interpretation [close | intermediate | clear] (motion) or [flat | left | right | up | down] (tilt)
		*/
		const _getSensorInterpretation = function(value, sensorType) {
			let interpretation = 'unknown';

			if (sensorType === 'motion') {

				if (value <= 60) {
					interpretation = 'close';
				} else if (isValueBetween(value, 61, 109)) {
					interpretation = 'intermediate';
				} else if (value >= 110) {
					interpretation = 'clear';
				}

			} else if (sensorType === 'tilt') {

				if (isValueBetween(value, 14, 18)) {
					interpretation = 'up';
				} else if (isValueBetween(value, 51, 55)) {
					interpretation = 'right';
				} else if (isValueBetween(value, 95, 100)) {
					interpretation = 'flat';
				} else if (isValueBetween(value, 143, 148)) {
					interpretation = 'down';
				} else if (isValueBetween(value, 191, 196)) {
					interpretation = 'left';
				}

			}

			return interpretation;
		};


		/**
		* check if a value is between two other values
		* @returns {undefined}
		*/
		const isValueBetween = function(value, compare1, compare2) {
			const min = (compare1 <= compare2) ? compare1 : compare2,
				max = (compare1 > compare2) ? compare1 : compare2;

			return (value >= min && value <= max);
		};

	//-- End general stuff that's equal for all instances,




	//-- Start SBrickExtended class definition

		class SBrickExtended extends SBrick {

			// CONSTRUCTOR

			/**
			* Create a new instance of the SBrickExtended class (and accordingly also WebBluetooth)
			* @param {string} sbrick_name - The name of the sbrick
			*/
			constructor( sbrick_name ) {
				super( sbrick_name);

				// make vars available for outside world
				this.PORTS = {
					TOP_LEFT: 0,
					BOTTOM_LEFT: 1,
					TOP_RIGHT: 2,
					BOTTOM_RIGHT: 3
				};

				// vars for sensor timeouts
				this.sensorTimer = null;
				this.sensorTimeoutIsCancelled = false;
			};


			// PUBLIC FUNCTIONS

			/**
			* update a set of lights
			* @param {object} data - New settings for this port {portId, power (0-100), direction}
			* @returns {undefined}
			*/
			setLights(data) {
				data.power = Math.round(this.MAX * data.power/100);
				this.drive(data);
			};



			/**
			* update a drive motor
			* @param {object} data - New settings for this port {portId, power (0-100), direction}
			* @returns {undefined}
			*/
			setDrive(data) {
				data.power = _drivePercentageToPower(data.power);
				this.drive(data);
			};



			/**
			* update a servo motor
			* @param {object} data - New settings for this port {portId, angle (0-90), direction}
			* @returns {undefined}
			*/
			setServo(data) {
				data.power = _servoAngleToPower(data.angle);
				this.drive(data);
			};



			/**
			* read sensor data and send event
			* @param {number} portId - The id of the port to read sensor data from
			* @returns {undefined}
			*/
			getSensorData(portId) {
				this.getSensor(portId, 'wedo')
					.then((sensorData) => {
						// sensorData: { type, voltage, ch0_raw, ch1_raw, value }
						// add interpretation to sensorData
						sensorData. interpretation = _getSensorInterpretation(sensorData.value, sensorData.type);
						const event = new CustomEvent('sensorchange.sbrick', {detail: sensorData});
						//TODO event should only be sent if sensorvalue really changes
						document.body.dispatchEvent(event);

						clearTimeout(this.sensorTimer);// clear timeout within then-clause so it will always clear right before setting new one
						if (!this.sensorTimeoutIsCancelled) {
							// other functions may want to cancel the sensorData timeout
							// but they can't call clearTimeout, because that might be called when the promise is pending
							this.sensorTimer = setTimeout(() => {
								this.getSensorData(portId);
							}, 200);
						}
					});
			}



			/**
			* start stream of sensor measurements
			* @param {number} portId - The id of the port to read sensor data from
			* @returns {undefined}
			*/
			startSensor(portId) {
				this.sensorTimeoutIsCancelled = false;
				this.getSensorData(portId);
				const data = {portId};

				const event = new CustomEvent('sensorstart.sbrick', {detail: data});
				document.body.dispatchEvent(event);
			}


			/**
			* stop the sensor
			* @returns {undefined}
			*/
			stopSensor(portId) {
				// sensorData timeout is only set when the promise resolves
				// but in the time the promise is pending, there is no timeout to cancel
				// so let's set a var that has to be checked before calling a new setTimeout
				this.sensorTimeoutIsCancelled = true;
				const data = {portId};

				const event = new CustomEvent('sensorstop.sbrick', {detail: data});
				document.body.dispatchEvent(event);
			};




		}

	//-- End SBrickExtended class definition

	return SBrickExtended;

})();
