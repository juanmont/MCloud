// require modules
var fs = require('fs');
var archiver = require('archiver');
var tools = require('./utils');


var _sys = tools.module;
var _model = require('./Data');





var PH = module.exports = function(package_size){

  this.data = new _model.Data('mongodb://localhost:5223/mcloud');


  //console.log(_model);
  this._qoldidx =1;
  this._qnewidx =1;
  this._qstorage={};

  this._i=0;
  this._package_size = package_size;
  this._petitions = [];




};

PH.prototype.size = function(){
  return this._qnewidx - this._qoldidx;
};

PH.prototype.enqueue = function(data) {
  this._qstorage[this._qnewidx] = data;
  this._qnewidx++;
};

PH.prototype.dequeue = function(){
  var oldIdx = this._qoldidx,
      newIdx = this._qnewidx,
      toDelete;

  if (oldIdx !== newIdx){
    toDelete = this._qstorage[oldIdx];
    delete this._qstorage[oldIdx];
    this._qoldidx++;

    return toDelete;
  }
};


PH.prototype.add_petition= function(data){


  this._petitions[this._i] = data;
  this._i++;





  if (this._i == this._package_size){
    var id = tools.generateTimeId();
    //var id = "petition_example"+this._i;
    var petitions = this._petitions;
    create_package(this, petitions, id);
    this.enqueue(id);
    this._i = 0;
  }





};


// private functions
/**************************************************************************/
function create_package(self, petitions, id){

  // create a file to stream archive data to.


  var output = fs.createWriteStream(__dirname + '/push/'+id+'_wiki.tar.gz');
  var archive = archiver('tar', {
      gzip: true,
      store: true // Sets the compression method to STORE.
  });

  // listen for all archive data to be written
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);


  //we create the first data entry
  archive.append(JSON.stringify(petitions[0]), {name: i+'.json'});
  self.data.do(_model.op.insert, {ready: false});

  self.data.do(_model.content.get, {});

  for (var i = 1, len = petitions.length; i < len; i++){

    archive.append(JSON.stringify(petitions[i]), {name: i+'.json'});

  }


  // finalize the archive (ie we are done appending files but streams have to finish yet)
  archive.finalize();

}

var p = new PH(2);
p.add_petition({
  nombre: "prueba"
});
p.add_petition({
  nombre: "prueba2"
});
