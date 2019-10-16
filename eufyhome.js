/* jshint esversion: 6*/
const eufyAPI = require('node-eufy-api');

module.exports = function(RED) {
    function EufyHomeNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        eufyAPI.loadDevices(node.credentials.username, node.credentials.password).then(
            function(deviceList){
                deviceList.forEach(function(device) {
                    if(device.name == config.name) {
                        node.device = device;
                        node.log('Found matching device: '+config.name);
                        node.status({fill:"green",shape:"dot",text:"Found matching device"});
                    }
                });

                if(!node.device) {
                    node.warn('No matching device found for '+config.name);
                    node.status({fill:"red",shape:"dot",text:"Check name. Matching device"});
                }
            }
        );

        node.on('input', function(msg, send, done) {
            const switchIsOn = msg.payload == 'on';

            node.device.connect().then(function() {
                return node.device.setPowerOn(switchIsOn);
            }).then(function() {
                return node.device.disconnect();
            }).then(function() {
                if(done) {
                    done();
                }
            });
        });
    }

    RED.nodes.registerType("eufy-home",EufyHomeNode, {
        credentials: {
            username: {type:"text"},
            password: {type:"password"}
        }
    });
}
