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

```
setLights({portId, power (0-100)})
```

```
setDrive({portId, power (0-100), direction})
```

```
setServo({portId, angle (0-90), direction})
```

```
startSensor(portId)
```






## Authors

* **Jarón Barends** - *Initial work* - [jaronbarends](https://github.com/jaronbarends)

See also the list of [contributors](https://github.com/jaronbarends/your-project/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

