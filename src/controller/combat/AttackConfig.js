const AttackConfig = {
    cooldown: 400,
    duration: 200,
    knockbackPower: 150,
    hitboxes: {
        forward: { width: 145, height: 132, offsetX: 100, offsetY: 0 },
        up: { width: 140, height: 120, offsetX: 20, offsetY: -80 },
        down: { width: 140, height: 110, offsetX: 20, offsetY: 80 },
        forwardLeft: { width: 120, height: 120, offsetX: -80, offsetY: 0 },
        forwardRight: { width: 120, height: 120, offsetX: 80, offsetY: 0 },
    },
    speedCompMax: 20,
    speedCompFactor: 0.1,
    verticalBounce: -400
};

export default AttackConfig;