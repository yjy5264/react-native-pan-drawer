import {DeviceEventEmitter} from "react-native";

export default class Emitter {
    static to(eventName, ...data) {
        DeviceEventEmitter.emit(eventName, ...data);
    }

    static on(eventName, handler) {
        let subscription = DeviceEventEmitter.addListener(eventName, handler);
        handler.__subscription__ = subscription;
        return subscription;
    }

    static off(eventName, handler) {
        if (handler.__subscription__) {
            handler.__subscription__.remove();
        } else {
            throw new Error(eventName + " has none subscription");
        }
    }
}