/**
 * @description 
 *
 *
 * @param {String} href 		Full URL which should be associated to the 
 * uploaded file, including the `basename`. 
 * For instance, <service>.blob.core.windows.net/<container>/<key>, where **key**
 * not only includes `dirname` but also the desired `basename`. 
 */
var Stream 		= require('stream')
,   selftils 	= require("./selftils")
;




module.exports = function(client, href, cb){
	const VAULT = selftils.parseAzureStorageUri(href);


	//
	var UPLOADER_STREAM = new Stream.Duplex();
	//
	UPLOADER_STREAM._read = function(size){};
	//
	var STREAM_LENGTH = 0;
	UPLOADER_STREAM._write = function(chunk, encoding, signal){
		STREAM_LENGTH += chunk.length;
		//gets its data by writing on itself
		this.push(chunk); 
		return signal();
	};
	//finish event is emitted after stream.end() method has been called, and all 
	//data have been flushed
	UPLOADER_STREAM.on('finish', function(){
			if (!STREAM_LENGTH) return cb(new Error("EX8712"));  //@TODO

			//passing null to read queue signals the end of the stream (EOF), after 
			//which no more data can be written. 
			//In fact, tells the consumer that stream is done outputting data
			this.push(null); //If removed, client (and the upload) hangs forever 	
			client.createBlockBlobFromStream(VAULT.container, VAULT.key, UPLOADER_STREAM, STREAM_LENGTH, function(e, r){
				if (e) return cb(e);
				//else: returns info about the blob just created
				const EXTRA_INFO = {
					uri: VAULT.service + ".blob.core.windows.net/" + VAULT.container + "/" + VAULT.key,
					service: VAULT.service,
					container: VAULT.container,
					key: VAULT.key,
					size: STREAM_LENGTH,
				};
				return cb(null, EXTRA_INFO);
			}
		);
		}
	);
	//emitted when data is completely consumed (read); here, when uploaded to Azure
	UPLOADER_STREAM.on('end', function(){});


	return UPLOADER_STREAM;
};