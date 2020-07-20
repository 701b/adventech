const mqtt = require('mqtt');
const moment = require('moment');
const { Pool } = require('pg');
const { mqttUri, pgConnOpt } = require('./keys');
const { sqlWriteValue } = require('./sql-cmds');

/**
 * Connecting to the Postgresql DB server
 */
const pool = new Pool(pgConnOpt);
pool.on('error', () => logger('Lost PG connection'));

/**
 * Connects to IotHub and Subscribes to the topic when the connection is made.
 */
const client = mqtt.connect(mqttUri);
const topic = 'fetal-information';

client.on('connect', (connack) => {
  logger('Connected to IoTHub');

  client.subscribe(topic, (err, granted) => {
    if (!err) logger(`Subscribed to ${topic}`);
  });
});

/**
 * Saves data to the Postgresql DB when receiving a message.
 */
client.on('message', async (topic, message, packet) => {
  const heartRate = message.toString();
  logger(`Received data from ${topic}: ${heartRate}`);

  try {
    const result = await pool.query(sqlWriteValue, [heartRate]);

    const row = result['rows'][0];
    row.timestamp = moment(row.timestamp).format('MM-DD HH:mm:ss');

    console.log('----> Added a new row:');
    console.table(row);
  } catch (err) {
    console.error('Error adding data...', err.stack);
  }
});

/**
 * Helper function
 */
function logger(s) {
  console.log(Date() + ' -- ' + s);
}