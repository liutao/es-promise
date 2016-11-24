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
		reject(promise, e);
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

	this._fulfillArr.forEach((k,index)=>{
		if (isFunction(k)) {
			this._childArr[index]._result = k(promise._result);
		} else {
			this._childArr[index]._result = value;
		}
	})
}

function reject(promise, reason){
	if (promise._status !== PENDING) { return };

	promise._result = reason;
	promise._status = REJECTED;

	this._rejectArr.forEach((k,index)=>{
		if (isFunction(k)) {
			this._childArr[index]._result = k(promise._result);
		} else {
			this._childArr[index]._result = value;
		}
	})
}
// 写一个函数统一处理

// 处理then
function dealThen(promise, child, x){
	if (isFunction(x)) {
		try{
			if (promise._status == FULFILLED) {
				fulfill(child, x(promise._result));
			} else {
				reject(child, x(promise._result));
			}
		}catch(e){
			reject(child, e);
		}
	} else {
		return promise._result;
	}
}

// 内部创建Promise对象时使用的空函数
function noop(){}

class Promise1{
	constructor(resolver){
		this._status = PENDING;
		this._result = undefined;
		this._childArr = [];
		this._fulfillArr = [];
		this._rejectArr = [];

		if (resolver == noop) { return};
		if (!isFunction(resolver)) {
			throw new TypeError('参数必须为function');
		};
		this instanceof Promise ? initPromise(this, resolver) : throw new TypeError('Promise不可以直接作为函数调用');
	}
	then(onFulfilled, onRejected){
		let child = new Promise(noop);
		if (this._status !== PENDING) {
			if (this._status == FULFILLED) {
				dealThen(this, child, onFulfilled);
			} else {
				dealThen(this, child, onRejected);
			}
		} else {
			this._childArr.push(child);
			this._fulfillArr.push(onFulfilled);
			this._rejectArr.push(onRejected);
		}
		return child;
	}
}

window.Promise =  Promise1;


