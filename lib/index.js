var ChildProcess = require('child_process');

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
	ChildProcess.exec('ps ' + args, function( err, stdout, stderr) {
        
        if (err || stderr) {
            return callback( err || stderr.toString( 'utf-8' ) );
        }
        else {
            stdout = stdout.toString('utf-8');
            callback(null, stdout.trim() || false);
        }
	});
};

/**
 * Query Process: Focus on pid & cmd
 * @param query
 * @param {String|Number} query.pid
 * @param {String} query.command RegExp String
 * @param {String} query.arguments RegExp String
 * @param {Function} callback
 * @param {Object=null} callback.err
 * @param {Object[]} callback.processList
 * @return {Object}
 */

exports.lookup = function(query, callback) {
    var format = [ 'pid', 'command' ];
	var formatStr = parseFormat( format );
	var exeArgs = [];
    var filter = {};

	// Lookup by PID
	if (query.pid) {
		var pid = query.pid;
		if (Array.isArray(pid)) {
			pid = pid.join(',');
		}

        exeArgs.push( '-p' );
        exeArgs.push( pid );
	}

    if( query.command ){

        filter[ 'command' ] = new RegExp( query.command );
    }

    if( query.arguments ){
        filter[ 'arguments' ] = new RegExp( query.arguments );
    }

    exeArgs.push( formatStr );

    return Exec( exeArgs, function(err, output) {
        if (err) {
            return callback( err );
        }
        else {

            var processList = parseGrid(output, format);
            var resultList = [];

            processList.forEach(function( p ){

                var flt;
                var type;
                var result = true;

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
 * Parse the stdout into readable object.
 * @param {String} output
 * @param {String[]} format
 */

function parseGrid( output, format ) {
	if ( !output ) {
        return output;
    }

    var commandIndex;
    if( ( commandIndex = format.indexOf( 'comm' ) ) >= 0 ){
        format[ commandIndex ] = 'command';
    }
    else if( ( commandIndex = format.indexOf( 'command' ) ) >= 0 ){
        format.splice( commandIndex + 1, 0, 'arguments' );
    }

    var lines = output.split( '\n' ).splice( 1 );
    return lines.map( function( line ) {

        var processInfo = {};
        var processInfoArr = line.trim().split( /\s+/ );

        processInfoArr.forEach(function( i, idx ){
            var type = format[ idx ] || 'arguments';

            if( type == 'arguments' ){
                if( typeof processInfo[ type ] != 'undefined' ){
                    processInfo[ type ] += ' ' + i;
                }
                else {
                    processInfo[ type ] = i;
                }
            }
            else {
                processInfo[ type ] = i;
            }
        });

		return processInfo;
	});
}

function parseFormat(format) {
	if (typeof format === 'string') {
		format = format.split(' ');
	}
	format = format.map(function(item) {
		return '-o ' + item;
	});

	return format.join(' ');
}

