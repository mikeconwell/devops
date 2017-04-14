
var SourceFile = process.argv[2]; // 0 is node, 1 is script name, arguments begin at 3rd position (index 2)
var TargetFile = SourceFile + '.sdf';

if (typeof SourceFile === 'undefined' || SourceFile.length < 1) {
	console.log('Error, a filename must be supplied.  Correct usage: \n   $ node convert_tsv.js filename\n\nAn output file has not been created.  Ending script.');
	return;
}


const fs = require('fs');


var SourceData = fs.readFileSync(SourceFile, 'utf8');
// Replace Spaces in sample file with pipes '|'
var TargetData = SourceData.replace(/ /g,'|');
// Replace tabs in sample file with spaces.  Spaces are necessary for the ip_source_report
TargetData = TargetData.replace(/\t/g,' ');


fs.writeFileSync(TargetFile, TargetData, 'utf8');

fs.readdir(process.cwd(), function (err, files) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(files);
});