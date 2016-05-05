# ps [![Build Status](https://travis-ci.org/neekey/ps.svg)](https://travis-ci.org/neekey/ps)

A Node.js module for looking up running processes. This module uses [Table-Parser](https://github.com/neekey/table-parser) to parse the output.

Before using this module, you should take look at section [Existing Bugs You Should Know](https://github.com/neekey/ps#user-content-existing-bugs-you-should-know) at the bottom of this doc.

## Install

```bash
$ npm install ps-node
```

## Usage

Lookup process with specified `pid`:

```javascript
var ps = require('ps-node');

// A simple pid lookup
ps.lookup({ pid: 12345 }, function(err, resultList ) {
    if (err) {
        throw new Error( err );
    }

    var process = resultList[ 0 ];

    if( process ){

        console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
    }
    else {
        console.log( 'No such process found!' );
    }
});

```

Or use RegExp to filter `command` and `arguments`:

```javascript
var ps = require('ps-node');

// A simple pid lookup
ps.lookup({
    command: 'node',
    arguments: '--debug',
    }, function(err, resultList ) {
    if (err) {
        throw new Error( err );
    }

    resultList.forEach(function( process ){
        if( process ){

            console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
        }
    });
});

```

Also, you can use `kill` to kill process by `pid`:

```javascript
var ps = require('ps-node');

// A simple pid lookup
ps.kill( '12345', function( err ) {
    if (err) {
        throw new Error( err );
    }
    else {
        console.log( 'Process %s has been killed!', pid );
    }
});
```

You can also pass arguments to `lookup` with `psargs` as arguments for `ps` command（Note that `psargs` is not available in windows):

```javascript
var ps = require('ps-node');

// A simple pid lookup
ps.lookup({
    command: 'node',
    psargs: 'ux'
    }, function(err, resultList ) {
    if (err) {
        throw new Error( err );
    }

    resultList.forEach(function( process ){
        if( process ){
            console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
        }
    });
});

```

Lastly, you can filter a list of items by their PPID by passing a PPID to filter on. You will need to pass in a `psarg` that provides the PPID in the results (`-l` or `-j` for instance).

```javascript
var ps = require('ps-node');

// A simple pid lookup
ps.lookup({
    command: 'mongod',
    psargs: '-l',
    ppid: 82292
    }, function(err, resultList ) {
    if (err) {
        throw new Error( err );
    }

    resultList.forEach(function( process ){
        if( process ){
            console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
        }
    });
});

```

## Existing Bugs You Should Know

I'm still working on these bugs at the moment, before using this module in any serious way, please take a look at them, and take your own risk.

- [Non-english characters may cause parse error](https://github.com/neekey/table-parser).
- [This module may not work on Windows](https://github.com/neekey/ps/issues/10). 
