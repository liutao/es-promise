require('./dist/promise1')
function defer(){
    var dfd = {}
    dfd.promise = new Promise2(function(resolve, reject) {
    	dfd.resolve = resolve
    	dfd.reject = reject
    })
    return dfd
}

module.exports = {
  resolved: function(a) { return Promise2.resolve(a); },
  rejected: function(a) { return Promise2.reject(a);  },
  deferred: defer
};
