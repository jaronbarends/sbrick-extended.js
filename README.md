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

### Control lights

```
setLights({portId, power (0-100)})
```

Convenience method for controlling lights.
Method should return `sbrick.drive`'s promise (to be implemented)

### Control drive motor

```
setDrive({portId, power (0-100), direction})
```

### Control servo motor

```
setServo({portId, angle (0-90), direction})
```

### Start stream of sensor measurements

```
startSensor(portId)
```

### Stop stream of sensor measurements

```
stopSensor(portId)
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

