'use strict';

// @TODO clean up

var prevContext = 0,
    // dont throw false positives on user created names or syntax
    ignoreMe = /[$.#{}(=>&)*]|(if)|(for)|(@block)(@media)(@extends)/;

// check that selector properties are sorted alphabetically
module.exports = function sortAlphabetically( line, valid ) {
    if ( typeof line !== 'string' ) { return; }

    var
        indentCount = 0,
        currContext = 0,
        isItSorted = false,
        arr = line.split(/[\s\t,:]/),
        sortedArr = [],
        validCSS = false;

    // the most basic of checks, throw warning if zindex duplicated elsewhere
    arr.forEach(function( val, i ) {
        if ( arr[i].length === 0 ) {
            indentCount++; // spaces or tabs
        }
        else {
            currContext = indentCount / this.config.indentSpaces;
        }
    }.bind( this ));

    // get all single spaces in the line
    arr = arr.filter(function( str ) {
        return str.length > 0;
    });

    // if current context switched, reset array
    if ( prevContext !== currContext ) {
        this.alphaCache = [];
    }

    // push prop values into our 'cache'
    if ( typeof arr[0] !== 'undefined' && arr[0].length > 0 && currContext > 0 && !ignoreMe.test( line ) ) {
        valid.css.forEach(function( val, index ) {
            var i = 0,
                j = 0;

            // console.log(arr[0])
            // console.log(val)

            if ( arr[ 0 ] === val ) {
                validCSS = true;
                return;
            }

            for ( i; i < valid.prefixes.length; i++ ) {
                if ( arr[ 0 ] === ( valid.prefixes[ i ] + val ) ) {
                    validCSS = true;
                    return;
                }
            }

            for ( j; j < valid.pseudo.length; j++ ) {
                if ( arr[ 0 ] === ( val + valid.pseudo[ j ] ) ) {
                    validCSS = true;
                    return;
                }
            }
        }.bind( this ));

        if ( validCSS ) {
            // console.log( arr[ 0 ] );
            this.alphaCache.push( arr[ 0 ] );
        }
    }
    else {
        return true;
    }

    if ( line.indexOf('(') !== -1 && line.indexOf(')') !== -1 ) {
        return true;
    }

    if ( ignoreMe.test( line ) || this.alphaCache.length < 1 ) {
        return true;
    }

    // create a copy of the cache
    this.alphaCache.forEach(function( val, i ) {
        sortedArr.push( this.alphaCache[i] );
    }.bind( this ));

    // and then sort it
    sortedArr = sortedArr.sort();

    // console.log( this.alphaCache );
    // // console.log( sortedArr );
    // console.log( this.alphaCache.length );
    // console.log( currContext );

    // now compare
    if ( this.alphaCache.length === sortedArr.length ) {

        if ( this.state.hash === false && currContext === prevContext ) {

            // compare each value individually
            this.alphaCache.forEach(function( val, i ) {
                // if any value doesn't match quit the forEach
                if ( sortedArr[i] !== this.alphaCache[i] ) {
                    isItSorted = false;
                    return;
                }
                // if match, check for valid css before we set it to true
                else {
                    valid.css.forEach(function( val, index ) {
                        var i = 0,
                            j = 0;

                        if ( this.alphaCache[ 0 ] === val ) {
                            isItSorted = true;
                            return;
                        }

                        for ( i; i < valid.prefixes.length; i++ ) {
                            if ( this.alphaCache[ 0 ] === ( valid.prefixes[ i ] + val ) ) {
                                isItSorted = true;
                                return;
                            }
                        }

                        for ( j; j < valid.pseudo.length; j++ ) {
                            if ( this.alphaCache[ 0 ] === ( val + valid.pseudo[ j ] ) ) {
                                isItSorted = true;
                                return;
                            }
                        }
                    }.bind( this ));

                    valid.html.forEach(function( val, index ) {
                        var i = 0,
                            j = 0;

                        if ( this.alphaCache[ 0 ] === val ) {
                            isItSorted = true;
                            return;
                        }

                        for ( j; j < valid.pseudo.length; j++ ) {
                            if ( this.alphaCache[ 0 ] === ( val + valid.pseudo[ j ] ) ) {
                                isItSorted = true;
                                return;
                            }
                        }
                    }.bind( this ));
                }
            }.bind( this ));
        }
        else {
            isItSorted = true;
        }
    }

    // save our curr context so we can use it to see our place
    prevContext = currContext;

    return isItSorted;
}