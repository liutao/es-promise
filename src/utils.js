export function isFunction(fun){
	return typeof fun === 'function';
}
export function isObjectOrFunction(x){
	return isFunction(x) || (typeof x === 'object' && x !== null)
}