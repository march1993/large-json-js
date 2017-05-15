'use strict';

const read_json = (filepath, encoding, callback) => {
	encoding = encoding || 'utf8';
	let stream = fs.createReadStream(filepath, encoding);
	let raw = [];
	stream.on('data', chunk => {
		raw.push(chunk);
	});
	stream.on('end', () => {

		const raw_length = raw.map(i => i.length).reduce((a, b) => a + b, 0);

		let buffer = {
			c_c: 0,
			c_p: 0,
			at: function (pos) {
				let c_c1 = this.c_c, c_p1 = this.c_p;
				while (pos + c_p1 >= raw[c_c1].length) {
					pos -= raw[c_c1].length - c_p1;
					c_p1 = 0;
					c_c1 += 1;
				}

				return raw[c_c1][c_p1 + pos];
			},
			slice: function (from, end) {
				let remain = end - from;
				let ret = '';
				let c_c1 = this.c_c, c_p1 = this.c_p;
				while (remain > 0) {
					if (end < (raw[c_c1].length - c_p1)) {
						ret += raw[c_c1].slice(c_p1 + from, c_p1 + end);
						remain = 0;
					} else
					if (from > (raw[c_c1].length - c_p1)) {
						from -= raw[c_c1].length - c_p1;
						end -= raw[c_c1].length - c_p1;
						c_c1 += 1;
						c_p1 = 0;
					} else {
						ret += raw[c_c1].slice(c_p1 + from);
						remain -= (raw[c_c1].length - c_p1 - from);
						end -= (raw[c_c1].length - c_p1);
						from = 0;
						c_p1 = 0;
						c_c1 += 1;
					}
				}
				return ret;
			},
			__skipped__: 0,
			skip: function (count) {
				while (count > 0) {
					if (count < (raw[this.c_c].length - this.c_p)) {
						this.c_p += count;
						count = 0;
					} else {
						count -= (raw[this.c_c].length - this.c_p);
						this.c_p = 0;
						this.c_c += 1;
					}
				}
				this.__skipped__ += count;
			},
			get length () {

				return raw_length - this.__skipped__;
			}
		};

		let res = null;

		const get_comma_or_end = (ignore) => {

			let k =buffer.at(0);
			while (k == ' ' || k == '\r' || k == '\n') {
				buffer.skip(1);
			}

			let a = buffer.at(0);

			if (a == '}') {
				buffer.skip(1);
				return '}';
			} else
			if (a == ']') {
				buffer.skip(1);
				return ']';
			} else
			if (a ==',') {
				buffer.skip(1);
				return ',';
			} else {
				if (! ignore) {
					throw new Error('Invalid Character');
				}
			}
		};

		const get_colon = () => {
			let k =buffer.at(0);
			while (k == ' ' || k == '\r' || k == '\n') {
				buffer.skip(1);
			}

			let a = buffer.at(0);
			buffer.skip(1);
			if (a == ':') {
				return ':';
			} else {
				throw new Error('Invalid Character');
			}
		};

		const get_key = () => {
			let k =buffer.at(0);
			while (k == ' ' || k == '\r' || k == '\n') {
				buffer.skip(1);
			}

			if (buffer.at(0) == '"') {
				return itr();
			} else {
				let i = 0;
				for (i = 0; i < buffer.length; i++) {
					if (buffer.at(i) == ':') {
						break;
					}

				}

				let key = buffer.slice(0, i);
				buffer.skip(i);
				return key;
			}
		};



		const itr = () => {

			while (buffer.at(0) == ' ' || buffer.at(0) == '\r' || buffer.at(0) == '\n') {
				// do nothing
				buffer.skip(1);
			}

			let a = buffer.at(0);
			buffer.skip(1);

			if (a == '"') {

				if (buffer.at(0) == '"') {
					buffer.skip(1);
					return '';
				} else {
					let i;
					let last = buffer.at(0);
					for (i = 0; i < buffer.length - 1; i++) {
						let next = buffer.at(i + 1);
						if (last != '\\' && next == '"') {
							break;
						}
						last = next;
					}
					i += 1;

					let res = buffer.slice(0, i);
					buffer.skip(i + 1);
					return res.replace(/\\\"/g, '"');
				}
			} else
			if ((a >= '0' && a <= '9') || a == '.' || a == '-' || a == '+') {

				let i ;
				for (i = 0; i < buffer.length; i++) {
					let k = buffer.at(i);
					if (k != '.' && (k < '0' || k > '9')) {
						break;
					}
				}

				let res = a + buffer.slice(0, i);
				buffer.skip(i);
				if (res.indexOf('.') >= 0) {
					return parseFloat(res);
				} else {
					return parseInt(res);
				}

			} else
			if (a == '[') {
				let obj = [];

				if (get_comma_or_end(true) == ']') {

				} else {
					while (true) {
						let item = itr();
						obj.push(item);
						let comma_or_end = get_comma_or_end();
						if (comma_or_end ==']') {
							break;
						}

					}
				}

				return obj;
			} else
			if (a == '{') {
				let obj = {};

				if (get_comma_or_end(true) == '}') {

				} else {
					while (true) {
						let key = get_key();
						get_colon();
						let value = itr();
						obj[key] = value;
						let comma_or_end = get_comma_or_end();
						if (comma_or_end == '}') {
							break;
						}
					}
				}

				return obj;

			} else
			if (a == 'n') {
				if (buffer.length < 3) {
					buffer_fetch();
				}
				let remain = buffer.slice(0, 3);
				buffer.skip(3);
				if (remain == 'ull') {
				 	return null;
				 } else {
				 	throw new Error('Invalid Character');
				 }

			} else
			if (a == 'f') {
				let remain = buffer.slice(0, 4);
				buffer.skip(4);
				if (remain == 'alse') {
					return false;
				} else {
					throw new Error('Invalid Character');
				}
			} else
			if (a == 't') {
				let remain = buffer.slice(0, 3);
				buffer.skip(3);
				if (remain == 'rue') {
					return true;
				} else {
					throw new Error('Invalid Character');
				}
			} else {
				throw new Error('Invalid Character');
			}
		};

		let result = itr();
		callback && callback(result);

	});

};


module.exports = read_json;
