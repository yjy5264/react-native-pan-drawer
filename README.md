# react-native-pan-drawer
A cross-platform (iOS&amp;Android), drawer component for React Native.
<br>Demo
------
<br>![](https://github.com/yjy5264/react-native-pan-drawer/raw/master/image/drawer.gif)
<br>Install
------
```javascript
npm install react-native-pan-drawer --save
```
<br>Usage
------
```javascript
<Drawer
    backgroundView = {() => {return <BackgroundView />}}
    leftView = {() => {return <LeftView />}}
    rightView = {() => {return <RightView />}}
    ref = {ref => this.drawer = ref}
/>

this.drawer.open();
this.drawer.close();
this.drawer.toggle();
```
