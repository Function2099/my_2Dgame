const AttackConfig = {
    cooldown: 300,
    duration: 150,
    knockbackPower: 150,
    hitboxes: {
        forward: { width: 84, height: 60, offsetX: 35, offsetY: 0 },
        up: { width: 90, height: 60, offsetX: 0, offsetY: -30 },
        down: { width: 90, height: 50, offsetX: 0, offsetY: 30 },
        forwardLeft: { width: 70, height: 60, offsetX: -30, offsetY: 0 },
        forwardRight: { width: 70, height: 60, offsetX: 30, offsetY: 0 },
    },
    speedCompMax: 20,
    speedCompFactor: 0.1,
    verticalBounce: -400
};

export default AttackConfig;