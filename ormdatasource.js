const { DataSource } = require('typeorm');
const dbConfig = require('./ormconfig');

const dataSource = new DataSource(dbConfig);

exports.default = dataSource;
