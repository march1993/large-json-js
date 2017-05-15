# large-json-js
These two functions are aimed to replace the default `JSON.stringify` and `JSON.parse`. The size of target JSON files are among 100MiB and 400Mib.

You have to conduct sufficient tests before using these two functions. They're not written under strict JSON standard.

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