/**
 * Created by yjy on 16/9/23.
 */

import React, {Component} from 'react'
import {
    View,
    PanResponder,
    Animated,
    Easing,
    Platform
} from 'react-native';

import {CSS} from './CSS'
import Emitter from './Emitter'

const drawerWidth = CSS.width()-68;
const drawerRatio = 0.85;
const drawerVx = Platform.OS == 'ios' ? 3/10 : 1/10000000;

export default class Drawer extends Component {
    constructor(props) {
        super(props);
        this.lastX = 0;
        this.onDrawerPress = false;
        this.state = {
            drawerX: new Animated.Value(0),
            scaleY: new Animated.Value(1),
            listScaleX: new Animated.Value(0),
            listScaleY: new Animated.Value(0),
            listX: new Animated.Value(-drawerWidth/2),
            toggle: false
        };
    }

    componentWillMount() {
        this._panInit();
        Emitter.on('drawerOpen', this._drawerOpen);
        Emitter.on('drawerClose', this._drawerClose);
        Emitter.on('drawerToggle', this._drawerToggle);
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        Emitter.off('drawerOpen', this._drawerOpen);
        Emitter.off('drawerClose', this._drawerClose);
        Emitter.off('drawerToggle', this._drawerToggle);
    }

    _panInit() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {
                this._moveEvent(gestureState);
                this.onDrawerPress = true;
            },
            onPanResponderMove: (evt, gestureState) => {
                this._moveEvent(gestureState);
                this.onDrawerPress = false;
            },
            onPanResponderRelease: (evt, gestureState) => {
                if(this.onDrawerPress) {
                    if(this.state.toggle) {
                        this._drawerClose();
                    }
                } else {
                    this._stopEvent(gestureState);
                }
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                return true;
            }
        });
    }

    open() {
        this._drawerOpen();
    };

    close() {
        this._drawerClose();
    };

    toggle() {
        this._drawerToggle();
    };

    _drawerOpen = () => {
        this._animatedEvent(drawerWidth, 'stop');
    };

    _drawerClose = () => {
        this._animatedEvent(0, 'stop');
    };

    _drawerToggle = () => {
        if(this.state.toggle) {
            this._drawerClose();
        } else {
            this._drawerOpen();
        }
    };

    _moveEvent(gestureState) {
        let dx = gestureState.dx;
        let x = dx+this.lastX;
        if(x > drawerWidth) {
            x = drawerWidth;
        }
        if(x < 0) {
            x = 0;
        }
        this._animatedEvent(x, 'move');
    }

    _stopEvent(gestureState) {
        let vx = gestureState.vx;
        let dx = gestureState.dx;
        let x = dx+this.lastX;
        if(x > (drawerWidth)/2) {
            x = drawerWidth;
        } else {
            x = 0;
        }
        if (vx > drawerVx) {
            x = drawerWidth;
        }
        if (vx < -drawerVx) {
            x = 0;
        }
        this._animatedEvent(x, 'stop');
    }

    _animatedEvent(x, type) {
        let ratio = x/drawerWidth;
        let height = (1-ratio)*(1-drawerRatio)+drawerRatio;
        let listScaleX = ratio;
        let listScaleY = ratio;
        let listX = (1-ratio)*(-drawerWidth/2);
        let AnimatedArr = [
            {value: this.state.drawerX, toValue: x},
            {value: this.state.scaleY, toValue: height},
            {value: this.state.listScaleX, toValue: listScaleX},
            {value: this.state.listScaleY, toValue: listScaleY},
            {value: this.state.listX, toValue: listX}
        ];
        for(let i = 0; i < AnimatedArr.length; i++) {
            Animated.timing(AnimatedArr[i].value, {
                toValue: AnimatedArr[i].toValue,
                duration: type == 'stop' ? 300 : 0,
                easing: Easing.cos
            }).start(type == 'stop' ? i == AnimatedArr.length-1 ? () => {
                this.lastX = this.state.drawerX._value;     //结束时调用获取lastX
                if(this.lastX < 20) {
                    //抽屉关闭
                    this.setState({toggle: false});
                    Emitter.to('drawerHasClosed');
                }
                if(this.lastX > drawerWidth-20) {
                    //抽屉打开
                    this.setState({toggle: true});
                    Emitter.to('drawerHasOpened');
                }
            } : null : null);
        }
    }

    render() {
        return (
            <View style = {{flex: 1, backgroundColor: '#ffffff'}}>
                <View style = {{flex: 1}}>
                    {this.props.backgroundView ? this.props.backgroundView() : null}
                </View>
                <Animated.View style = {{position: 'absolute', left: this.state.listX, top: 0, width: drawerWidth, height: CSS.height(), transform: [{scaleX: this.state.listScaleX}, {scaleY: this.state.listScaleY}]}}>
                    {this.props.leftView ? this.props.leftView() : null}
                </Animated.View>
                <Animated.View style = {{position: 'absolute', left: 0, top: 0, width: CSS.width(), height: CSS.height(), transform: [{scaleY: this.state.scaleY}, {translateX: this.state.drawerX}]}}>
                    {this.props.rightView ? this.props.rightView() : null}
                    <View style = {{position: 'absolute', left: 0, bottom: 0, width: !this.state.toggle ? CSS.pixel(40) : 68, height: CSS.height()-CSS.pixel(150), backgroundColor: 'rgba(0,0,0,0)'}} {...this.panResponder.panHandlers} />
                </Animated.View>
            </View>
        )
    }
}