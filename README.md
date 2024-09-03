# geigerjs
Enabling Geiger counters via the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API).

It's a small reverse-engineering project, use it at your own risk.

### Requirements

Compatible with the following devices:
1. Voltcraft RM-400
2. PCE-RAM 10

Bluetooth API is available in Chrome on Android, Chrome OS, Linux, and Mac. Mozilla has a [negative stance on the standard](https://mozilla.github.io/standards-positions/#web-bluetooth), similar to its position on [USB](https://mozilla.github.io/standards-positions/#webusb).

### Who needs security?

Note: These Geiger devices do not appear to be implemented properly, particularly given that they allow for the execution of commands. This concern extends not only to Geiger counters but also to other devices from those manufacturers, such as ["smart home" devices](https://pushstack.wordpress.com/2018/01/25/voltcraft-sem-3600bt-who-needs-security/).
