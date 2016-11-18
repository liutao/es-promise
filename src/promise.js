const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

import {
	isFunction,
	isObjectOrFunction
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
		if (value._status == FULFILLED) {
			fulfill(promise, value._result);
		} else if (value._status == REJECTED) {
			reject(promise, value._result);
		} else {

		}
	} else if (isObjectOrFunction(value)){

	} else {
		fulfill(promise, value);
	}
}

function fulfill(promise, value){
	if (promise._status !== PENDING) { return };

	promise._result = value;
	promise._status = FULFILLED;

	this._fulfillArr.forEach((k)=>{
		if (isFunction(k)) {
			k(promise._result);
		};
	})
}

class Promise{
	constructor(resolver){
		this._status = PENDING;
		this._result = undefined;
		this._fulfillArr = [];
		this._rejectArr = [];

		if (!isFunction(resolver)) {
			throw new TypeError('参数必须为function');
		};
		initPromise(this, resolver);
	}
}
