/**
 * @description
 * Parses Azure BLob service URI into an Object containing as much information 
 * as possible about the route. 
 *
 * 
 * @param {String} uri          Azure Blob Service URL in its canonical 
 * form https://<service>.blob.core.windows.net/<container>/<key>. 
 * Si la URI carece de protocolo (http:// o https://)
 *
 * 
 * @return {Object}             Parsed info about the Blob Storage on Azure. 
 * It contains:
 *
 * + **uri**: 
 * + **href**:
 * + **protocol**:  
 * + **auth**:
 * + **hostname**: 
 * + **port**:
 * + **resource**: 
 * + **pathname**: 
 * + **dirname**: 
 * + **basename**:
 * + **service**: 
 * + **container**: 
 * + **key**: 
 * + **prefix**: makes it easier to generate names (keys) for the blobs being uploaded,
 * reducing the operation to a simple append.  
 *
 * 
 * @example 
 * Consider the URI https://fakeservice.blob.core.windows.net/fakecontainer/foo/bar, 
 * it generates: 
 * 
 * + uri: https://fakeservice.blob.core.windows.net/fakecontainer/foo/bar    igual a uri
 * + href: https://fakeservice.blob.core.windows.net/fakecontainer/foo/bar
 * + protocol: https 
 * + auth:
 * + hostname: fakeservice.blob.core.windows.net
 * + port:
 * + resource: fakecontainer/foo/bar     sin initial `/`
 * + pathname: foo/bar              overrides `#pathname` generado por parseUrl      
 * + dirname: foo                             sin trailing '/'
 * + basename: bar
 * + service: fakeservice
 * + container: fakecontainer
 * + key: foo/bar
 * + prefix: foo/bar/               facilita generar nombres (keys) de los blobs subidos, reduciendolo a un append   
 *
 * 
 * @important 
 * In some edge cases, `pathname` and `dirname` might be empty strings. Such 
 * cases arise if we are on the root of the `container` (in those cases, `basename` 
 * is not an empty string, but undefined @TODO).
 * `prefix` in an ancillary, operational property; not a property of the route itsel.
 */
var parseUrl    = require('url').parse
,   _           = require('lodash')
;




exports.parseAzureStorageUri = function(uri){
    //@TODO esta no es ni mucho menos la mejor forma de hacer esto. Deberia lanzar error.
    //inyeccion de protocolo
    const IS_HTTP = uri.indexOf("http") !== -1;
    const IS_HTTPS = uri.indexOf("https") !== -1;
    if (!IS_HTTP && !IS_HTTPS) uri = "http://" + uri;


    const STORAGE       = parseUrl(uri);
    //
    STORAGE.uri         = STORAGE.href;
    STORAGE.resource    = STORAGE.pathname.slice(1);
    STORAGE.path        = _.tail(STORAGE.resource.split("/"));
    STORAGE.pathname    = STORAGE.path.join("/");
    STORAGE.basename    = _.last(STORAGE.path);
    STORAGE.dirname     = _.initial(STORAGE.path).join("/");
    //
    STORAGE.service     = STORAGE.hostname.split(".")[0];
    STORAGE.container   = _.head(STORAGE.resource.split("/"));
    STORAGE.key         = STORAGE.pathname;
    //
    STORAGE.prefix      = (STORAGE.pathname)? STORAGE.pathname+"/" : "";

    return STORAGE;
};