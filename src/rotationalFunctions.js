import * as THREE from "three";

export function periodToRotationSpeed(radius, period) {
    return 2 * Math.PI * radius / period;
}

export function getAxialTilt(inclination) {
    var rad = inclination * Math.PI / 180;
    return new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0);
}