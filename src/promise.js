const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

import {
	isFunction,
	isObjectOrFunction
} from './utils';

// 异步调用函数的方式，暂时只用setTimeout
function asyncCall(fun){
	setTimeout(fun, 0)
}

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

// Promise Resolution Procedure
function resolve(promise, value){
	// 2.3.1 如果promise和value指向同一对象
	if (promise === value) {
		reject(promise, new TypeError('不可以resolve Promise实例本身'))
	// 2.3.2 如果value是一个promise
	} else if (value.constructor == Promise) {
		if (value._status == FULFILLED) {
			fulfill(promise, value._result);
		} else if (value._status == REJECTED) {
			reject(promise, value._result);
		} else {
			resolve(promise, value);
		}
	// 2.3.3 如果x是一个object或function
	} else if (isObjectOrFunction(value)){
		try{
			let then = value.then;
		} catch (e) {
			reject(promise, e);
		}
		if (isFunction(then)) {
			try{
				handleThenable(promise, value, then);
			} catch (e) {
				reject(promise, e);
			}
		} else {
			fulfill(promise, value);
		}
	// 2.3.4 value不是对象或函数
	} else {
		fulfill(promise, value);
	}
}

function handleThenable(promise, value, then){
	// setTimeout(()=>{
		let settled = false; // 是否fulfilled或rejected
		try {
			then.call(value, (otherValue)=>{
				if (settled) { return};
				resolve(promise, otherValue);
				settled = true;
			}, (reason)=>{
				if (settled) { return};
				reject(promise, reason);
				settled = true;
			})
		} catch (e) {
			if (settled) { return};
			settled = true;
			reject(promise, e)
		}
		
	// },0);
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

class Promise{
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
		if (this instanceof Promise) {
			initPromise(this, resolver)
		} else {
			throw new TypeError('Promise不可以直接作为函数调用')
		}
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
	catch(onRejected){
		return this.then(undefined, onRejected);
	}
}

// window.Promise =  Promise;



