'use strict';

const write_json = (filepath, data, callback) => {
	let file = fs.createWriteStream(filepath);
	file.on('open', ev => {

		const buffer_size = 64 * 1024;
		let buffer = '';
		const buffer_push = partial => {
			buffer += partial;
			if (buffer.length > buffer_size) {
				file.write(buffer);
				buffer = '';
			}
		}

		const itr = partial => {
			if (partial instanceof Array) {

				buffer_push("[");
				for (let i = 0; i < partial.length; i++) {
					itr(partial[i]);

					if (i < partial.length - 1) {
						buffer_push(',');
					}
				}
				buffer_push("]");

			} else
			if (partial instanceof Object) {
				buffer_push('{');

				let keys = Object.keys(partial);
				let is_first = true;
				for (let i = 0; i < keys.length; i++) {
					let key = keys[i];
					if (partial[key] !== undefined) {

						if (is_first) {
							is_first = false;
						} else {
							buffer_push(',');
						}

						buffer_push('\"');
						buffer_push(key.replace(/\"/g, '\\\"'));
						buffer_push('\":');

						itr(partial[keys[i]]);


					}
				}


				buffer_push('}');
			} else
			if (partial === true) {
				buffer_push('true');
			} else
			if (partial === false) {
				buffer_push('false');
			} else
			if ((typeof partial) === 'string' || partial instanceof String) {
				buffer_push('\"' + partial.replace(/\"/g, '\\\"').replace(/\n/g, '\\n') + '\"');
			} else
			if ((typeof partial) === 'number' || partial instanceof Number) {
				buffer_push(partial.toString());
			} else
			if (partial === null) {
				buffer_push('null');
			} else
			if (partial === undefined) {
				buffer_push('null');
			} else {
				if (! partial.toString) {
					console.log(partial)
				}
				buffer_push('\"' + partial.toString().replace(/\"/g, '\\\"') + '\"');
			}
		};

		itr(data);

		file.write(buffer);
		buffer = '';

		file.end();

		callback && callback();
	});
};

module.exports = write_json;
