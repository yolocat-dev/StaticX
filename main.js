const express = require('express');
const fs = require('fs');
const config = require('./config.json');
const path = require('path');

const app = express();

app.get('/:file(*)', (req, res) => {
	if(!hasAccess(req.params.file, req.headers)) {
		res.status(403).send('Forbidden');
	} else {
		readFiles(req.params.file, res);
	}
});

function hasAccess(file, headers) {
	const username = headers['staticx-username'];
	const password = headers['staticx-password'];

	for(const user of config.auth) {
		if(user.username === username && user.password === password) {
			for(const r of user.files) {
				if(new RegExp(r).test(file)) return true;
			}
		}
	}

	return false;
}

const filePath = path.join(__dirname, config.server.files || 'static');

function readFiles(input, res) {
	if(input.endsWith('/')) input = input.substring(0, input.length - 1);
	
	if(fs.existsSync(path.join(filePath, input))) {
		if(fs.statSync(path.join(filePath, input)).isDirectory()) {
			res.status(400).send('Not a file');
		} else {
			res.status(200).download(path.join(filePath, input));
		}
	} else {
		res.status(404).send('Not found');
	}
}

app.listen(config.server.port || 41408, () => {
	console.log(`[StaticX] Listening on port ${config.server.port || 41408}`);
});