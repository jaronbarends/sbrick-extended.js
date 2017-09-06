#SBrickExtended.js

Extended functionality for [sbrick.js](https://github.com/360fun/sbrick.js). Stuff I would like to be in the library, implemented as a sub-class

## Requirements

* Requires sbrick.js, bluetooth.js and promise-queue library
* https://github.com/360fun/sbrick.js
* https://github.com/360fun/bluetooth.js
* https://github.com/azproduction/promise-queue

## Getting started

Include scripts you would normally need for sbrick.js
```
<script src="promise-queue.js"></script>
<script src="bluetooth.js"></script>
<script src="bluetooth-dummy.js"></script>
<script src="sbrick.js"></script>
```

Add SBrickExtended
```
<script src="SBrickExtended.js"></script>
```

Instead of instantiating SBrick, instantiate SBrickExtended
```
const mySbrick = new SBrickExtended();
```

You can now use all of sbrick.js's functionality, plus some extended functionalities.

## Additional public methods

### `setLights(data)`

Method for controlling lights. This is actually a convenience wrapper around `sbrick.drive`.

```
const data = {
    portId: mySBrick.TOPLEFT,
    power: 100// number 0-100
};
mySBrick.setLights(data);
```

Returns `undefined`. (It should return `sbrick.drive`'s promise (to be implemented))

### `setDrive(data)`

Method for controlling a drive motor. This is actually a convenience wrapper around `sbrick.drive`.

```
const data = {
    portId: mySBrick.TOPLEFT,
    power: 100,// number 0-100
    direction: mySBrick.CCW
};
mySBrick.setDrive(data);
```

Returns `undefined`. (It should return `sbrick.drive`'s promise (to be implemented))

### `setServo(data)`

Method for controlling a servo motor. This is actually a convenience wrapper around `sbrick.drive`.

```
const data = {
    portId: mySBrick.TOPLEFT,
    angle: 90,// number 0-90
    direction: mySBrick.CCW
};
mySBrick.setServo(data);
```

Returns `undefined`. (It should return `sbrick.drive`'s promise (to be implemented))

Be aware that the Power Functions servo motors only allow 7 angles per 90°. These angles are in increments of approximately 13°, i.e. 13, 26, 39, 52, 65, 78, 90. `setServo` calculates the supported angle that's closest to the value of `data`'s `angle`-property


### `startSensor(portId)`

Starts a stream of sensor measurements and sends events when the sensor's value or the interpretation of the value changes.

```
mySBrick.startSensor(mySBrick.TOPLEFT);
```

### `stopSensor(portId)`

Stop a stream of sensor measurements.

```
mySBrick.stopSensor(mySBrick.TOPLEFT);
```

## Additional events

### sensorstart.sbrick

Triggered on `document.body` when a stream of sensor measurements is started
data sent with `event.detail`: `{portId}`

### sensorstop.sbrick

Triggered on `document.body` when a stream of sensor measurements is stopped
data sent with `event.detail`: `{portId}`

### sensorchange.sbrick

Triggered when the interpretation of a port's sensor value changes. (Sensors return a value; a range of values corresponds with an interpretation.) Interpretations depend on the type of sensor.
It would be better to call this _state_ instead of _interpretation_

data sent with `event.detail`: `{type, voltage, ch0_raw, ch1_raw, value, interpretation}`

Possible `interpretation` values for motion sensor:
`close`: the sensor is within a few centimeters of an object;
`midrange`: the sensor is within ca. 5-15 centimeters of an object;
`clear`: there is no object within ca 15 centimeters of the sensor

Possible `interpretation` values for tilt sensor:
`flat`, `up`, `down`, `left`, `right`

### sensorvaluechange.sbrick

Triggered when the value of a port's sensor changes. The sensors aren't very accurate, so most of the time you'll want to use the `sensorchange.sbrick` event instead. May come in usefull for the motion sensor. 

## Authors

* **Jarón Barends** - *Initial work* - [jaronbarends](https://github.com/jaronbarends)

See also the list of [contributors](https://github.com/jaronbarends/your-project/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

