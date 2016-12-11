const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

import {
	isFunction,
	isObjectOrFunction
} from './utils';

// 异步调用函数的方式，暂时只用setTimeout
function asyncCall(fun,args){
	setTimeout(()=>{
		fun.apply(null, args);
	}, 0)
}

function initPromise(promise, resolver){
	// 当调用传入的resolver函数抛出异常，则reject当前promise
	try {
		resolver(function(value){
			// 封装的内部函数，处理resolve(value)，也就是Promise Resolution Procedure
			resolve(promise, value);
		}, function(reason){
			// 封装的内部函数，处理reject(reason)
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
	} else if (value instanceof Promise) {
		// 2.3.2.2 如果value处于fulfilled状态，则使用相同的value值fulfill promise。
		if (value._status == FULFILLED) {
			fulfill(promise, value._result);
		// 2.3.2.3 如果value处于rejected状态，则使用相同的reason值reject promise。
		} else if (value._status == REJECTED) {
			reject(promise, value._result);
		// 2.3.2.1 如果value处于pending状态，则promise同样pending并直到value状态改变。
		// 重新把resolve(promise, value)添加到队列
		} else {
			asyncCall(resolve, [promise, value]);
		}
	// 2.3.3 如果x是一个object或function
	} else if (isObjectOrFunction(value)){
		// 2.3.3.2 如果获取value.then的值时抛出异常，则通过该异常reject promise
		try{
			let then = value.then; // 2.3.3.1 使then等于value.then
			// 2.3.3.3 如果then是一个函数
			if (isFunction(then)) {
				try{
					handleThenable(promise, value, then);
				} catch (e) {
					reject(promise, e);
				}
			// 2.3.3.4 如果then不是一个函数
			} else {
				fulfill(promise, value);
			}
		} catch (e) {
			reject(promise, e);
		}
	// 2.3.4 value不是对象或函数
	} else {
		fulfill(promise, value);
	}
}

function handleThenable(promise, value, then){
	let settled = false; // 是否fulfilled或rejected
	try {
		// 2.3.3.3 如果then是一个函数，则把value作为函数中this指向来调用它
		then.call(value, (otherValue)=>{
			// 2.3.3.3.3 
			if (settled) { return};
			// 2.3.3.3.1 如果resolvePromise通过传入y来调用，则执行resolve(promise, y)
			resolve(promise, otherValue);
			settled = true;
		}, (reason)=>{
			// 2.3.3.3.3 
			if (settled) { return};
			// 2.3.3.3.2 如果rejectPromise 通过传入原因r来调用，则传入r来reject promise
			reject(promise, reason);
			settled = true;
		})
	// 2.3.3.3.4 如果调用then抛出异常e
	} catch (e) {
		// 2.3.3.3.4.1 如果resolvePromise或rejectPromise已经调用，则忽略
		if (settled) { return};
		settled = true;
		// 2.3.3.3.4.2 否则，则传入e来reject promise
		reject(promise, e)
	}
}

function fulfill(promise, value){
	// 如果状态已经不是pending，则直接return
	if (promise._status !== PENDING) { return };
	// 设置状态为fulfilled，并设置最终结果
	promise._status = FULFILLED;
	promise._result = value;
	// 异步依次调用添加的onFulfilled方法
	if (promise._fulfillArr.length > 0) {
		// 2.2.6.1 如果promise fulfilled，则所有的onFulfilled回调函数按照它们添加的顺序依次调用。
		promise._fulfillArr.forEach((k,index)=>{
			// 2.2.5 onFulfilled和onRejected必须作为函数来调用，没有this值
			asyncCall(dealThen, [promise, promise._childArr[index], k])
		});
	}
}

function reject(promise, reason){
	// 如果状态已经不是pending，则直接return
	if (promise._status !== PENDING) { return };

	// 设置状态为rejected，并设置最终结果
	promise._status = REJECTED;
	promise._result = reason;

	// 异步依次调用添加的onRejected方法
	if (promise._rejectArr.length > 0) {
		// 2.2.6.2 如果promise rejected，则所有的onRejected回调函数按照它们添加的顺序依次调用。
		promise._rejectArr.forEach((k,index)=>{
			// 2.2.5 onFulfilled和onRejected必须作为函数来调用，没有this值
			asyncCall(dealThen, [promise, promise._childArr[index], k])
		});
	}
}

// 处理then
function dealThen(promise, child, x){
	// onFulfilled或onRejected是一个函数
	if (isFunction(x)) {
		// 2.2.7.1 如果onFulfilled或onRejected返回了一个值value，则执行resolve(child, value)
		try {
			resolve(child, x(promise._result));
		// 2.2.7.2 如果onFulfilled或onRejected抛出了异常e，则reject child并传入原因e
		} catch (e) {
			reject(child, e);
		}
	} else {
		try{
			// 2.2.1.1 如果onFulfilled不是一个函数，则忽略
			if (promise._status == FULFILLED) {
				fulfill(child, promise._result);
			// 2.2.1.2 如果onRejected不是一个函数，则忽略
			} else {
				reject(child, promise._result);
			}
		} catch (e) {
			reject(child, e);
		}
	}
}

// 内部创建Promise对象时使用的空函数
function noop(){}

class Promise{
	constructor(resolver){
		this._status = PENDING; // 保存内部的状态
		this._result = undefined; // 保存promise对象fulfill或reject的最终结果 
		this._childArr = []; // 调用then方法创建的子promise对象
		this._fulfillArr = []; // 调用then方法添加的onFulfilled方法
		this._rejectArr = []; // 调用then方法添加的onRejected方法

		if (resolver == noop) { return}; // then方法内部创建promise时间使用

		// 如果resolver不是函数，则抛出TypeError错误
		if (!isFunction(resolver)) {
			throw new TypeError('参数必须为function');
		};
		// 如果直接调用Promise而非通过new关键词创建，同样抛出TypeError错误
		if (this instanceof Promise) {
			initPromise(this, resolver)
		} else {
			throw new TypeError('Promise不可以直接作为函数调用')
		}
	}

	then(onFulfilled, onRejected){
		let child = new Promise(noop);
		// 如果当前对象状态已经改变，则直接根据状态调用响应的回调
		if (this._status !== PENDING) {
			if (this._status == FULFILLED) {
				// 2.2.4 异步调用
				asyncCall(()=>{
					dealThen(this, child, onFulfilled);
				})
			} else {
				// 2.2.4 异步调用
				asyncCall(()=>{
					dealThen(this, child, onRejected);
				})
			}
		// 如果当前对象处于pending状态，则把onFulfilled, onRejected添加到
		} else {
			this._childArr.push(child);
			this._fulfillArr.push(onFulfilled);
			this._rejectArr.push(onRejected);
		}
		// 2.2.7 返回一个新的promise对象
		return child;
	}
	catch(onRejected){
		return this.then(undefined, onRejected);
	}
}

Promise.resolve = function(value){
	return new Promise(function(resolve){resolve(value)})
}
Promise.reject = function(reason){
	return new Promise(function(resolve, reject){reject(reason)})
}
Promise.all = function(arr){
	let newPormise = new Promise(noop),
		value = [],
		num = 0;
	if (({}).toString.call(arr) === '[object Array]') {
		try{
			arr.forEach(function(k, index){
				if (k instanceof Promise) {
					let timer = setInterval(()=>{
						if (k._status == FULFILLED) {
							value[index] = k._result;
							num++;
							clearInterval(timer);
							if (num == arr.length) {
								fulfill(newPormise, value);
							};
						} else if (k._status == REJECTED) {
							reject(newPormise, k._result);
							clearInterval(timer);
						};
					}, 0);
				} else {
					value[index] = k;
					num++;
					if (num == arr.length) {
						fulfill(newPormise, value);
					};
				}
			});
		} catch (e) {
			reject(newPormise, e);
		}
		
	} else {
		reject(newPormise, new TypeError('参数必须是一个promise数组'));
	}
	return newPormise;
}
Promise.race = function(arr){
	let newPormise = new Promise(noop);
	if (({}).toString.call(arr) === '[object Array]') {
		try{
			arr.forEach(function(k, index){
				if (k instanceof Promise) {
					let timer = setInterval(()=>{
						if (k._status == FULFILLED) {
							fulfill(newPormise, k._result);
							clearInterval(timer);
						} else if (k._status == REJECTED) {
							reject(newPormise, k._result);
							clearInterval(timer);
						};
					}, 0);
				} else {
					fulfill(newPormise, value);
				}
			});
		} catch (e) {
			reject(newPormise, e);
		}
		
	} else {
		reject(newPormise, new TypeError('参数必须是一个promise数组'));
	}
	return newPormise;
}

global.Promise1 = Promise
// module.exports = Promise


