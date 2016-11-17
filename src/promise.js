const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

import {
	isFunction
} from './utils';

function initPromise(promise, resolver){
	try {
		resolver(function(value){
			resolve(promise, value);
		}, function(reason){
			reject(promise, reason);
		});
	} catch (e) {
		reject(promise, reason);
	}
}

function resolve(promise, value){
	if (promise === value) {
		reject(promise, new TypeError('不可以resolve Promise实例本身'))
	} else if (value.constructor == Promise) {

	}
}

class Promise{
	constructor(resolver){
		this._status = PENDING;
		this._calls = [];

		if (!isFunction(resolver)) {
			throw new TypeError('参数必须为function');
		};
		initPromise(this, resolver);
	}
}
