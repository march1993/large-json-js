# large-json-js
This two functions are aimed to replace the default `JSON.stringify` and `JSON.parse`. The size of target JSON files are among 100MiB and 400Mib.


# read_json
```javascript
(filepath, encoding, callback) => {}
```

encoding: default utf-8


# write_json
```javascript
(filepath, data, callback) => {}
```

callback: data => {}

# TODO
* Although `read_json` won't crash, but it's still too slow in compare to the `write_json`. 