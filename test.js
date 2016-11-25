require('./dist/promise')
function defer(){
    var dfd = {}
    dfd.promise = new Promise1(function(resolve, reject) {
    	dfd.resolve = resolve
    	dfd.reject = reject
    })
    return dfd
}

console.log(Promise1.a);
module.exports = {
  resolved: function(a) { return Promise1.resolve(a); },
  rejected: function(a) { return Promise1.reject(a);  },
  deferred: defer
};
