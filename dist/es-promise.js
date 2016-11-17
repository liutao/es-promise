/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _classCallCheck2 = __webpack_require__(1);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _utils = __webpack_require__(2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var PENDING = "pending";
	var FULFILLED = "fulfilled";
	var REJECTED = "rejected";

	function initPromise(promise, resolver) {
		try {
			resolver(function (value) {
				resolve(promise, value);
			}, function (reason) {
				reject(promise, reason);
			});
		} catch (e) {
			reject(promise, reason);
		}
	}

	function resolve(promise, value) {
		if (promise === value) {
			reject(promise, new TypeError('不可以resolve Promise实例本身'));
		} else if (value.constructor == Promise) {}
	}

	var Promise = function Promise(resolver) {
		(0, _classCallCheck3.default)(this, Promise);

		this._status = PENDING;
		this._calls = [];

		if (!(0, _utils.isFunction)(resolver)) {
			throw new TypeError('参数必须为function');
		};
		initPromise(this, resolver);
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isFunction = isFunction;
	function isFunction(fun) {
		return typeof fun === 'function';
	}

/***/ }
/******/ ]);