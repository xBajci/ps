var PS = require( '../index' );

PS.lookup( { pid: 10623 }, function( err, list ){

    console.log( err, list );

    PS.lookup( { command: 'node', arguments: 'run.mac' }, function( err, list ){

        console.log( err, list );
    });
});