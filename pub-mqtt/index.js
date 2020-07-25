const mqtt = require("mqtt");
const dataGen = require("./data-gen");

/**
 * -- Gets credentials from env variables
 */
// const esServices = JSON.parse(process.env.ENSAAS_SERVICES);
// const mqttUri = esServices['p-rabbitmq'][0].credentials.protocols.mqtt.uri

/**
 * Use credentials directly from local device
 * Inspect the credentials inside the secret and fill out the following variables.
 */
const username = "ed6e5a2a-5899-11ea-8729-f6bfce9fbbfd:4caaff04-5c83-11ea-a754-822f0a4826ef";
const password = "UMD0heROZNK4eNBt9axlNykpS";
const externalHosts = "rabbitmq-001-pub.sa.wise-paas.com";
const mqttUri = `mqtt://${username}:${password}@${externalHosts}:1883`;

const topic = "fetal-information/total_fetal_information";

/**
 * Connects to the IoTHub service using MQTT URI
 */
const client = mqtt.connect(mqttUri);
client.on("connect", (connack) => {
    setInterval(() => {
        publishFetalInfo();
    }, dataGen.dataGenPeriod * 1000);
});

/**
 * Publish fetal info
 */
function publishFetalInfo() {
    const fetal_information = dataGen.generateData();
    const name = "patient1"
    const data = `${name}:${fetal_information["heartRate"]}:${fetal_information["isFetusMoved"]}`
    
    client.publish(topic, data, {qos: 0}, (err, packet) => {
        if (!err) console.log(`Data sent to ${topic} -- ${name}:${fetal_information["heartRate"]}:${fetal_information["isFetusMoved"]}`);
    });
}
