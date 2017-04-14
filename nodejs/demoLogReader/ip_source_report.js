/* 
*  Author:  Mike Conwell
*  Created: 13 April 2017 
*/

const fs = require('fs');
const path = require('path');

var sourceSuffix = '';                 // if empty string, all files in the sourceDirectory will be examined.  
                                       // sourceSuffix = '.log' is used for design and testing.
var sourceDirectory = process.argv[2]; // 0 is node, 1 is script name, arguments begin at 3rd position (index 2)
var sourceFile = '';                   // 

var reportText = "#source_ip ':' ' ' count";

if (typeof sourceDirectory === 'undefined' || sourceDirectory.length < 1) {
	console.log('Error: A directory path argument must be supplied.  Correct usage: \n   $ node ip_source_report.js path\n\nEnding script.\n\n');
	return;
} else if ( fs.existsSync(sourceDirectory) !== true ) {
	console.log('An invalid path has been supplied:\n  path="'+sourceDirectory+'"\n\nPlease examine the path supplied and correct as necessary.\nEnding Script.\n\n')
	return;
}




// Given an array/list of file names, and referring to common variable sourceSuffix, return an array consisting of just files ending with a certain suffix, eg. .log
function logsOnly(value) {
	var i = -1 * sourceSuffix.length;
	if (value.slice(i) == sourceSuffix ) {
		return value;
	}
}


// Using the supplied variale sourceDirectory, return a list of files.
function listFiles(sourceDirectory) {
	if (typeof sourceSuffix === 'undefined' || sourceSuffix.length < 1) {
		return fs.readdirSync(sourceDirectory);
	}
	else {
		return fs.readdirSync(sourceDirectory).filter(logsOnly);	
	}
}

// from http://stackoverflow.com/questions/9658690/is-there-a-way-to-sort-order-keys-in-javascript-objects
// this nicens up the order of keys in an object so we can list IPs in ascending order. (alphetically, not alphanumerically)
function orderKeys(obj, expected) {

  var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
      if (k1 < k2) return -1;
      else if (k1 > k2) return +1;
      else return 0;
  });

  var i, after = {};
  for (i = 0; i < keys.length; i++) {
    after[keys[i]] = obj[keys[i]];
    delete obj[keys[i]];
  }

  for (i = 0; i < keys.length; i++) {
    obj[keys[i]] = after[keys[i]];
  }
  return obj;
}


// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 



// Gather a list of files found in the supplied direction in an array. 
var yFiles = listFiles(sourceDirectory);
var yLines = [];
var yLine = [];
var ip = '';
var protocol = '';



/* Now let's build an object and begin looping through our list of files to 
*  determine a list of Source_IP addresses that made an html call using the TLSv1 protocol
*/
var o = {};
for (var i = 0; i < yFiles.length; i++) {
	sourceFile = sourceDirectory + path.sep + yFiles[i];

	// create an array for each line in the file
	// we could use .readline() however, it creates an excess of console output
	yLines = fs.readFileSync(sourceFile,'utf8').split('\n');

	// loop through each line of the file and create an array of the line itself, parsed by spaces outside of quotations
	for (var ii = 0 ; ii < yLines.length; ii++) {

		yLine = yLines[ii]
			                    // some files end each line with /r/n and others /n.  Remove trailing /r if present.
			.replace(/\r/g,'')
					            // nice regex from http://stackoverflow.com/questions/16261635/javascript-split-string-by-space-but-ignore-space-in-quotes-notice-not-to-spli
			.match(/(?:[^\s"]+|"[^"]*")+/g)
		;

		if (typeof yLine !== 'undefined' && yLine !== null && typeof yLine[1] !== 'undefined' && typeof yLine[7] !== 'undefined' ) {
			
			// grab the ipv4 portion of the address leaving off the port following the colon (eg 127.0.0.1:8445)
			ip = yLine[1].split(':')[0];  
			protocol = yLine[7];  

			if ( protocol === 'TLSv1' ) {

				// Success!! add an object entry if not defined, then increment.
				if (typeof o[ip] === 'undefined') o[ip] = 0;	
				o[ip] += 1;
			}
		} // end if(yLine) validation
		/* else {
			console.log('line ' + (ii+1) + ' ignored as an invalid log entry: ' + yLines[ii] );
		} */
	} // end for(yLines.length)
} // end for(yFiles.length)

o = orderKeys(o);

for (var e in o) {
	reportText += '\n' + e + ': ' + o[e];
}

// if a Trailing carraige return is desired, uncomment the following line.
// reportText += '\n';


console.log(reportText);

