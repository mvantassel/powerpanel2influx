'use strict';

const Influx = require('influx');
const request = require('request-promise');

const checkInterval = process.env.UPDATE_INTERVAL_MS || 1000 * 30;

const influxClient = new Influx.InfluxDB({
    host: process.env.INFLUX_HOST || 'localhost',
    port: process.env.INFLUX_PORT || 8086,
    protocol: process.env.INFLUX_PROTOCOL || 'http',
    database: process.env.INFLUX_DB || 'powerpanel',
    username: process.env.INFLUX_USER || '',
    password: process.env.INFLUX_PASS || ''
});

const powerPanelConfig = {
    host: process.env.POWERPANEL_HOST || 'localhost',
    port: process.env.POWERPANEL_PORT || '3052',
    protocol: process.env.POWERPANEL_PROTOCOL || 'http'
}

let metricsRequestObj = {
    method: 'GET',
    url: `${powerPanelConfig.protocol}://${powerPanelConfig.host}:${powerPanelConfig.port}/agent/ppbe.js/init_status.js`,
    json: true,
    gzip: true,
    resolveWithFullResponse: true
};

function getPowerPanelMetrics() {
    log(`${new Date()}: Getting Power Panel Metrics`);

    return request(metricsRequestObj);
}

function onGetPowerPanelMetrics(response) {
    log(`${new Date()}: Parsing Power Panel Metrics`);

    let body = response.body;

    // PowerPanel init_status.js allows access to UPS data without authentication but its response is a JS variable in the body :(
    let metrics = JSON.parse(body.substr(14).slice(0, -2));

    if (!metrics.status) {
        return;
    }

    let output_data = {
        load: metrics.status.output.load,
        state: metrics.status.output.state,
        voltage: metrics.status.output.voltage,
        watt: metrics.status.output.watt
    }

    let utlity_data = {
        state: metrics.status.utility.state,
        voltage: metrics.status.utility.voltage
    }

    let battery_data = {
        runtimeHour: metrics.status.battery.runtimeHour,
        runtimeMinute: metrics.status.battery.runtimeMinute,
        capacity: metrics.status.battery.capacity
    }

    writeToInflux('utility', utlity_data).then(function() {
        console.dir(`wrote PowerPanel utility data to influx: ${new Date()}`);
    });
    
    writeToInflux('output', output_data).then(function() {
        console.dir(`wrote PowerPanel output data to influx: ${new Date()}`);
    });

    writeToInflux('battery', battery_data).then(function() {
        console.dir(`wrote PowerPanel battery data to influx: ${new Date()}`);
    });

}

function writeToInflux(seriesName, values, tags) {
    return influxClient.writeMeasurement(seriesName, [
        {
            fields: values,
            tags: tags
        }
    ]);
}

function log(message) {
    console.log(message);
}

function handleError(err) {
    log(`${new Date()}: Error`);
    log(err);
}

function restart(err) {
    if (err) {
        console.log(err);
    }

    // Every {checkInterval} seconds
    setTimeout(getMetrics, checkInterval);
}

function getMetrics() {
    getPowerPanelMetrics()
        .then(onGetPowerPanelMetrics)
        .catch(handleError)
        .finally(restart);
}

log(`${new Date()}: Initialize PowerPanel2Influx`);
getMetrics();
