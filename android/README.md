# Nari Surakshya / VoxShield - Android Module

## Architecture & Components

- **Kotlin & Jetpack Compose**: Modern UI components and state management.
- **SmsEmergencyService.kt**: Kotlin utility leveraging native `SmsManager` to intercept high/critical risk events and automatically broadcast emergency SMS with live GPS coordinates to trusted contacts and police emergency services (`112`).
- **Foreground Service**: Runs ambient audio YAMNet classification and secret phrase recognition in the background.
- **Fused Location Provider**: High-accuracy GPS location streaming.
- **Bluetooth Low Energy (BLE)**: Proximity emergency beacon mesh network.

## Android Permissions Required
- `android.permission.SEND_SMS`
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.RECORD_AUDIO`
- `android.permission.BLUETOOTH_SCAN`
- `android.permission.BLUETOOTH_ADVERTISE`
