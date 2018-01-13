# powerpanel2influx
Pipe Power Panel metrics to InfluxDB

Most basic form:

    docker run -d mvantassel/powerpanel2influx


# Configuration (ENV, -e)

Variable | Description | Default value | Sample value | Required?
-------- | ----------- | ------------- | ------------ | ---------
INFLUX_PROTOCOL | Is Influx SSL? | http | https | optional
INFLUX_HOST | Where is your InfluxDB running? | localhost | influxdb | recommended
INFLUX_PORT | What port is InfluxDB running on? | 8086 | 999 | optional
INFLUX_DB | What InfluxDB database do you want to use? | 'powerpanel' | 'potato' | required
INFLUX_USER | InfluxDB username | | | optional
INFLUX_PASS | InfluxDB password | metrics | | optional
POWERPANEL_HOST | Where is PowerPanel running? | localhost | powerpanel | optional
POWERPANEL_PORT | What port is Power Panel running on? | 3052 | 999 | optional
UPDATE_INTERVAL_MS | How often should it check for new metrics? | 30000 | 1000 | optional

## Tags

- latest
