var ChildProcess = require('child_process');
var IS_WIN = process.platform === 'win32';
var TableParser = require( 'table-parser' );

/**
 * Execute child process
 * @type {Function}
 * @param {String[]} args
 * @param {Function} callback
 * @param {Object=null} callback.err
 * @param {Object[]} callback.stdout
 */

var Exec = module.exports = exports = function( args, callback) {
	if (Array.isArray(args)) {
		args = args.join(' ');
	}

    var command = IS_WIN ? 'wmic process get' : 'ps';

	ChildProcess.exec( command + args, function( err, stdout, stderr) {
        
        if (err || stderr) {
            return callback( err || stderr.toString( 'utf-8' ) );
        }
        else {
            stdout = stdout.toString('utf-8');
            callback(null, stdout || false);
        }
	});
};

/**
 * Query Process: Focus on pid & cmd
 * @param query
 * @param {String|String[]} query.pid
 * @param {String} query.command RegExp String
 * @param {String} query.arguments RegExp String
 * @param {Function} callback
 * @param {Object=null} callback.err
 * @param {Object[]} callback.processList
 * @return {Object}
 */

exports.lookup = function(query, callback) {
	var exeArgs = [];
    var filter = {};
    var idList;

	// Lookup by PID
	if ( query.pid ) {

        if( Array.isArray( query.pid ) ){
            idList = query.pid;
        }
        else {
            idList = [ query.pid ];
        }
	}

    if( query.command ){
        filter[ 'command' ] = new RegExp( query.command );
    }

    if( query.arguments ){
        filter[ 'arguments' ] = new RegExp( query.arguments );
    }

    return Exec( exeArgs, function(err, output) {
        if (err) {
            return callback( err );
        }
        else {
            var processList = parseGrid( output );
            var resultList = [];

            processList.forEach(function( p ){

                var flt;
                var type;
                var result = true;
                // 若限定了id列表
                if( idList && idList.indexOf( String( p.pid ) ) < 0 ){
                    return;
                }

                for( type in filter ){
                    flt = filter[ type ];
                    result = flt.test( p[ type ] ) ? result : false;
                }

                if( result ){
                    resultList.push( p );
                }
            });

            callback( null, resultList );
        }
    });
};

/**
 * Kill process
 * @param pid
 * @param next
 */

exports.kill = function( pid, next ){

    var killCommand = IS_WIN ? 'taskkill ' : 'kill ';
    var command = killCommand + ( IS_WIN ? '/PID ' + pid : pid );

    ChildProcess.exec( command, function( err, stdout, stderr) {

        if (err || stderr) {
            return next( err || stderr.toString( 'utf-8' ) );
        }
        else {
            stdout = stdout.toString( 'utf-8' );
            next( null, stdout );
        }
    });
};

/**
 * Parse the stdout into readable object.
 * @param {String} output
 */

function parseGrid( output ) {
	if ( !output ) {
        return output;
    }
    return formatOutput( TableParser.parse( output ) );
}

/**
 * 格式化输出结构，从里面提取出 pid, command, arguments
 * @param data
 * @return {Array}
 */

function formatOutput( data ){

    var formatedData = [];

    data.forEach(function( d ){
        var pid = ( d.PID && d.PID[ 0 ] ) || ( d.ProcessId && d.ProcessId[ 0 ] ) || undefined;
        var cmd = d.CMD || d.CommandLine || undefined;

        var command = cmd[ 0 ];
        var args = '';

        if( cmd.length > 1 ){
            args = cmd.slice( 1 );
        }

        formatedData.push( {
            pid: pid,
            command: command,
            arguments: args
        });
    });

    return formatedData;
}