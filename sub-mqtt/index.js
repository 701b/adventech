const mqtt = require("mqtt");
const moment = require("moment");
const { Pool } = require("pg");
const { mqttUri, pgConnOpt } = require("./keys");
const { sqlWriteHeartRate, sqlWriteFetalMovement } = require("./sql-cmds");

/**
 * Connecting to the Postgresql DB server
 */
const pool = new Pool(pgConnOpt);
pool.on("error", () => logger("Lost PG connection"));

/**
 * Connects to IotHub and Subscribes to the topic when the connection is made.
 */
const client = mqtt.connect(mqttUri);
const topicOfHeartRate = "fetal-information/heart_rate";
const topicOfFetalMovement = "fetal-information/fetal_movement";

client.on("connect", (connack) => {
    logger("Connected to IoTHub");
    
    client.subscribe(topicOfHeartRate, (err, granted) => {
        if (!err) logger(`Subscribed to ${ topicOfHeartRate }`);
    });
    
    client.subscribe(topicOfFetalMovement, (err, granted) => {
        if (!err) logger(`Subscribed to ${ topicOfFetalMovement }`);
    });
});

/**
 * Saves data to the Postgresql DB when receiving a message.
 */
client.on("message", async (topic, message, packet) => {
    const data = message.toString();
    logger(`Received data from ${ topic }: ${ data }`);
    
    if (topic === topicOfHeartRate) {
        try {
            const result = await pool.query(sqlWriteHeartRate, [data]);
            
            const row = result["rows"][0];
            row.timestamp = moment(row.timestamp).format("MM-DD HH:mm:ss");
            
            console.log("----> Added a new row:");
            console.table(row);
        } catch (err) {
            console.error("Error adding data...", err.stack);
        }
    } else if (topic === topicOfFetalMovement) {
        try {
            const result = await pool.query(sqlWriteFetalMovement, [data]);
            
            const row = result["rows"][0];
            row.timestamp = moment(row.timestamp).format("MM-DD HH:mm:ss");
            
            console.log("----> Added a new row:");
            console.table(row);
        } catch (err) {
            console.error("Error adding data...", err.stack);
        }
    }
});

/**
 * Helper function
 */
function logger(s) {
    console.log(Date() + " -- " + s);
}